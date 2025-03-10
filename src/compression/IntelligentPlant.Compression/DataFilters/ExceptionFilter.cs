using IntelligentPlant.Compression.Models;

namespace IntelligentPlant.Compression.DataFilters
{

    /// <summary>
    /// <see cref="DataFilter"/> that checks for changes in sample value greater than a minimum 
    /// threshold.
    /// </summary>
    public sealed class ExceptionFilter : DataFilter
    {

        /// <summary>
        /// The data filter settings.
        /// </summary>
        private readonly ExceptionFilterSettings _settings;

        /// <summary>
        /// The last-emitted sample.
        /// </summary>
        public DataCoreTagValue LastEmitted { get; private set; }

        /// <summary>
        /// The last-received sample.
        /// </summary>
        public DataCoreTagValue LastReceived { get; private set; }

        /// <summary>
        /// The sample that was received prior to <see cref="LastReceived"/>.
        /// </summary>
        private DataCoreTagValue _previousLastReceived;

        /// <summary>
        /// The current deviation limits for the filter.
        /// </summary>
        public DeviationLimits DeviationLimits { get; private set; }


        /// <summary>
        /// Creates a new <see cref="ExceptionFilter"/> instance.
        /// </summary>
        /// <param name="pipeline">
        ///   The <see cref="Pipeline"/> that the data filter belongs to.
        /// </param>
        /// <param name="next">
        ///   The next data filter in the pipeline.
        /// </param>
        /// <param name="settings">
        ///   The data filter settings.
        /// </param>
        /// <exception cref="ArgumentNullException">
        ///   <paramref name="settings"/> is <see langword="null"/>.
        /// </exception>
        internal ExceptionFilter(Pipeline pipeline, DataFilter next, ExceptionFilterSettings settings) : base(pipeline, next)
        {
            _settings = settings ?? throw new ArgumentNullException(nameof(settings));
            LastEmitted = _settings.LastEmittedSample;
            LastReceived = _settings.LastReceivedSample;
            SetDeviationLimits();
        }


        /// <summary>
        /// Creates a new <see cref="ExceptionFilter"/> instance without an associated <see cref="Pipeline"/>.
        /// </summary>
        /// <param name="next">
        ///   The next data filter in the pipeline.
        /// </param>
        /// <param name="settings">
        ///   The data filter settings.
        /// </param>
        /// <exception cref="ArgumentNullException">
        ///   <paramref name="settings"/> is <see langword="null"/>.
        /// </exception>
        public ExceptionFilter(DataFilter next, ExceptionFilterSettings settings)
            : this(null, next, settings) { }


        /// <summary>
        /// Recomputes <see cref="DeviationLimits"/>.
        /// </summary>
        private void SetDeviationLimits()
        {
            var limits = ComputeDeviationLimits();
            DeviationLimits = new DeviationLimits(limits.LowLimit, limits.HighLimit);
        }


        /// <summary>
        /// Computes deviation limits based on the last-emitted sample.
        /// </summary>
        /// <returns>
        ///   A tuple containing the computed limits.
        /// </returns>
        private (double LowLimit, double HighLimit) ComputeDeviationLimits()
        {
            if (LastEmitted == null || double.IsNaN(LastEmitted.NumericValue))
            {
                return (double.NaN, double.NaN);
            }

            var absoluteDeviation = _settings.DeviationType switch
            {
                DeviationType.Percentage => Math.Abs(LastEmitted.NumericValue / 100 * _settings.DeviationLimit),
                DeviationType.Fraction => Math.Abs(LastEmitted.NumericValue * _settings.DeviationLimit),
                _ => Math.Abs(_settings.DeviationLimit)
            };

            return (LastEmitted.NumericValue - absoluteDeviation, LastEmitted.NumericValue + absoluteDeviation);
        }


        /// <summary>
        /// Tests if the specified sample passes the filter's tests.
        /// </summary>
        /// <param name="sample">
        ///   The sample.
        /// </param>
        /// <param name="reasonCode">
        ///   The reason code describing the pass or fail.
        /// </param>
        /// <returns>
        ///   <see langword="true"/> if the sample passes the filter's tests, or 
        ///   <see langword="false"/> otherwise.
        /// </returns>
        private bool PassesFilter(DataCoreTagValue sample, out byte reasonCode)
        {
            if (LastEmitted == null)
            {
                reasonCode = ReasonCodes.PassInitialSample;
                return true;
            }

            if (LastEmitted.UtcSampleTime >= sample.UtcSampleTime)
            {
                // Received sample is earlier than last-emitted.
                reasonCode = ReasonCodes.FailOutOfOrderTimestamp;
                return false;
            }

            if (_settings.MinimumResampleLimit > TimeSpan.Zero && sample.UtcSampleTime - LastEmitted.UtcSampleTime < _settings.MinimumResampleLimit)
            {
                // Minimum resample limit has not elapsed.
                reasonCode = ReasonCodes.FailMinimumResampleLimitNotExceeded;
                return false;
            }

            if (_settings.MaximumResampleLimit > TimeSpan.Zero && sample.UtcSampleTime - LastEmitted.UtcSampleTime >= _settings.MaximumResampleLimit)
            {
                // Maximum resample limit has elapsed.
                reasonCode = ReasonCodes.PassMaximumResampleLimitExceeded;
                return true;
            }

            if (LastEmitted.Status != sample.Status)
            {
                // Change in quality.
                reasonCode = ReasonCodes.PassQualityChange;
                return true;
            }

            if (double.IsNaN(DeviationLimits.LimitLow) || double.IsNaN(DeviationLimits.LimitHigh))
            {
                // NaN limit
                reasonCode = ReasonCodes.PassNaNLimit;
                return true;
            }

            if (LastEmitted.NumericValue == DeviationLimits.LimitLow)
            {
                // Last-emitted sample has the same value as the calculated low limit. This means
                // that either our deviation limit is zero, or the last-emitted sample is zero and
                // we are using a fraction- or percent-based limit calculation. In these circumstances
                // we will require the incoming value to be less than the low limit (i.e. there must
                // be a value change).
                if (sample.NumericValue < DeviationLimits.LimitLow)
                {
                    // < low limit
                    reasonCode = ReasonCodes.PassDeviationLimitLowExceeded;
                    return true;
                }
            }
            else if (sample.NumericValue <= DeviationLimits.LimitLow)
            {
                // <= low limit
                reasonCode = ReasonCodes.PassDeviationLimitLowExceeded;
                return true;
            }

            if (LastEmitted.NumericValue == DeviationLimits.LimitHigh)
            {
                // Last-emitted sample has the same value as the calculated high limit. This means
                // that either our deviation limit is zero, or the last-emitted sample is zero and
                // we are using a fraction- or percent-based limit calculation. In these circumstances
                // we will require the incoming value to be greater than the high limit (i.e. there
                // must be a value change).
                if (sample.NumericValue > DeviationLimits.LimitHigh)
                {
                    // > high limit
                    reasonCode = ReasonCodes.PassDeviationLimitHighExceeded;
                    return true;
                }
            }
            else if (sample.NumericValue >= DeviationLimits.LimitHigh)
            {
                // >= high limit
                reasonCode = ReasonCodes.PassDeviationLimitHighExceeded;
                return true;
            }

            reasonCode = ReasonCodes.FailInsideLimits;
            return false;
        }


        /// <inheritdoc/>
        protected override ValueTask<DataFilterWriteResult> ApplyFilterAsync(DataCoreTagValue sample, CancellationToken cancellationToken)
        {
            var pass = PassesFilter(sample, out var reasonCode);

            _previousLastReceived = LastReceived;
            LastReceived = sample;

            if (!pass)
            {
                return new ValueTask<DataFilterWriteResult>(new DataFilterWriteResult(false, reasonCode, null));
            }

            var samplesToEmit = new List<DataCoreTagValue>(2);

            if (_previousLastReceived != null && _previousLastReceived != LastEmitted)
            {
                samplesToEmit.Add(_previousLastReceived);
                LastEmitted = _previousLastReceived;
                _previousLastReceived = null;
            }

            if (LastReceived != null && LastReceived != LastEmitted)
            {
                samplesToEmit.Add(LastReceived);
                LastEmitted = LastReceived;
            }

            SetDeviationLimits();

            return new ValueTask<DataFilterWriteResult>(new DataFilterWriteResult(true, reasonCode, samplesToEmit));
        }


        /// <summary>
        /// Reason codes that explain why a sample passed or failed the filter's tests.
        /// </summary>
        public static class ReasonCodes
        {

            /// <summary>
            /// The reason code is unspecified.
            /// </summary>
            public const byte Unspecified = 0;

            /// <summary>
            /// The sample was the first ever sample received by the filter.
            /// </summary>
            public const byte PassInitialSample = 1;

            /// <summary>
            /// The maximum resample limit for the filter was exceeded.
            /// </summary>
            public const byte PassMaximumResampleLimitExceeded = 2;

            /// <summary>
            /// The quality of the sample was different to the last-received sample.
            /// </summary>
            public const byte PassQualityChange = 3;

            /// <summary>
            /// One or both of the computed deviation limits were <see cref="double.NaN"/>.
            /// </summary>
            public const byte PassNaNLimit = 4;

            /// <summary>
            /// The sample value was less than or equal to the low deviation limit.
            /// </summary>
            public const byte PassDeviationLimitLowExceeded = 5;

            /// <summary>
            /// The sample value was greater than or equal to the high deviation limit.
            /// </summary>
            public const byte PassDeviationLimitHighExceeded = 6;

            /// <summary>
            /// The timestamp of the sample was the same or earlier than the last-received sample.
            /// </summary>
            public const byte FailOutOfOrderTimestamp = 7;

            /// <summary>
            /// The sample value was inside the computed deviation limits.
            /// </summary>
            public const byte FailInsideLimits = 8;

            /// <summary>
            /// The minimum resample limit for the filter was not exceeded.
            /// </summary>
            public const byte FailMinimumResampleLimitNotExceeded = 9;

        }

    }
}
