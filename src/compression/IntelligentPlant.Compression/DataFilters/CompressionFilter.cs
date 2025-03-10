using IntelligentPlant.Compression.Models;

namespace IntelligentPlant.Compression.DataFilters
{

    /// <summary>
    /// <see cref="DataFilter"/> that applies compression filtering on incoming samples.
    /// </summary>
    public sealed class CompressionFilter : DataFilter
    {

        /// <summary>
        /// The data filter settings.
        /// </summary>
        private readonly CompressionFilterSettings _settings;

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
        /// Creates a new <see cref="CompressionFilter"/> instance.
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
        internal CompressionFilter(Pipeline pipeline, DataFilter next, CompressionFilterSettings settings) : base(pipeline, next)
        {
            if (settings == null)
            {
                throw new ArgumentNullException(nameof(settings));
            }
            _settings = settings ?? throw new ArgumentNullException(nameof(settings));
            LastEmitted = _settings.LastEmittedSample;
            LastReceived = _settings.LastReceivedSample;

            if (_settings.InitialState.HasValue)
            {
                DeviationLimits = _settings.InitialState.Value;
            }
            else
            {
                ResetDeviationLimits();
            }
        }


        /// <summary>
        /// Creates a new <see cref="CompressionFilter"/> instance without an associated 
        /// <see cref="Pipeline"/>.
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
        public CompressionFilter(DataFilter next, CompressionFilterSettings settings)
            : this(null, next, settings) { }


        /// <summary>
        /// Resets the <see cref="DeviationLimits"/> based on the last-received sample.
        /// </summary>
        private void ResetDeviationLimits()
        {
            var limits = ComputeDeviationLimitsForSample(LastReceived);
            DeviationLimits = new DeviationLimits(limits.LowLimit, limits.HighLimit);
        }


        /// <summary>
        /// Computes deviation limits for the specified sample.
        /// </summary>
        /// <returns>
        ///   A tuple containing the computed limits.
        /// </returns>
        private (double LowLimit, double HighLimit) ComputeDeviationLimitsForSample(DataCoreTagValue value)
        {
            if (value == null || double.IsNaN(value.NumericValue))
            {
                return (double.NaN, double.NaN);
            }

            var absoluteDeviation = _settings.DeviationType switch
            {
                DeviationType.Percentage => Math.Abs(value.NumericValue / 100 * _settings.DeviationLimit),
                DeviationType.Fraction => Math.Abs(value.NumericValue * _settings.DeviationLimit),
                _ => Math.Abs(_settings.DeviationLimit)
            };

            return (value.NumericValue - absoluteDeviation, value.NumericValue + absoluteDeviation);
        }


        /// <summary>
        /// Interpolates deviation limits at the specified sample time based on the provided inputs.
        /// </summary>
        /// <param name="sampleTime">
        ///   The sample time to interpolate deviation limits at.
        /// </param>
        /// <param name="lastEmittedSampleTime">
        ///   The timestamp of the filter's last-emitted sample.
        /// </param>
        /// <param name="lastReceivedSampleTime">
        ///   The timestamp of the filter's last-received sample.
        /// </param>
        /// <param name="lastReceivedValue">
        ///   The value of the filter's last-received sample.
        /// </param>
        /// <param name="lowLimit">
        ///   The low limit computed at the last-received sample time.
        /// </param>
        /// <param name="highLimit">
        ///   The high limit computed at the last-received sample time.
        /// </param>
        /// <returns>
        ///   A tuple containing the computed limits.
        /// </returns>
        public static (double LowLimit, double HighLimit) InterpolateDeviationLimitsForTimestamp(
            DateTime sampleTime,
            DateTime lastEmittedSampleTime,
            DateTime lastReceivedSampleTime,
            double lastReceivedValue,
            double lowLimit,
            double highLimit
        )
        {
            var x0 = lastEmittedSampleTime.ToUniversalTime().Ticks;
            var x1 = lastReceivedSampleTime.ToUniversalTime().Ticks;
            var x = sampleTime.ToUniversalTime().Ticks;

            var y0 = lastReceivedValue;
            var y1_min = lowLimit;
            var y1_max = highLimit;

            var y_min = y0 + (x - x0) * ((y1_min - y0) / (x1 - x0));
            var y_max = y0 + (x - x0) * ((y1_max - y0) / (x1 - x0));

            return (y_min, y_max);
        }


        /// <summary>
        /// Gets the most-restrictive low and high deviation limits from the provided limit sets.
        /// </summary>
        /// <param name="lowLimit1">
        ///   The first low limit.
        /// </param>
        /// <param name="highLimit1">
        ///   The first high limit.
        /// </param>
        /// <param name="lowLimit2">
        ///   The second low limit.
        /// </param>
        /// <param name="highLimit2">
        ///   The second high limit.
        /// </param>
        /// <returns>
        ///   A tuple containing the most-restricting low and high limits.
        /// </returns>
        private static (double LowLimit, double HighLimit) GetRestrictedDeviationLimits(double lowLimit1, double highLimit1, double lowLimit2, double highLimit2)
        {
            return (lowLimit2 > lowLimit1 ? lowLimit2 : lowLimit1, highLimit2 < highLimit1 ? highLimit2 : highLimit1);
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
                // No previously-emitted sample; automatic pass.
                reasonCode = ReasonCodes.PassInitialSample;
                return true;
            }

            if (LastReceived == null)
            {
                // No previously-received sample; automatic fail.
                reasonCode = ReasonCodes.FailSecondSample;
                return false;
            }

            if (LastReceived.UtcSampleTime >= sample.UtcSampleTime)
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

            if (LastReceived.Status != sample.Status)
            {
                // Change in quality.
                reasonCode = ReasonCodes.PassQualityChange;
                return true;
            }

            if (!double.IsNaN(sample.NumericValue) && double.IsNaN(LastReceived.NumericValue))
            {
                // NaN => Not NaN transition
                reasonCode = ReasonCodes.PassTransitionFromNaN;
                return true;
            }

            if (double.IsNaN(sample.NumericValue) && !double.IsNaN(LastReceived.NumericValue))
            {
                // Not NaN => NaN transition
                reasonCode = ReasonCodes.PassTransitionToNaN;
                return true;
            }

            if (double.IsNaN(sample.NumericValue))
            {
                // Sample is NaN, previous sample was also NaN, and to get this far we know that
                // we have not exceeded the maximum resample limit.
                reasonCode = ReasonCodes.FailInsideLimits;
            }
            else
            {
                if (double.IsNaN(DeviationLimits.LimitLow) || double.IsNaN(DeviationLimits.LimitHigh))
                {
                    // NaN limit
                    reasonCode = ReasonCodes.PassNaNLimit;
                    return true;
                }

                (var interpolatedLowLimit, var interpolatedHighLimit) = InterpolateDeviationLimitsForTimestamp(
                    sample.UtcSampleTime,
                    LastEmitted.UtcSampleTime,
                    LastReceived.UtcSampleTime,
                    LastReceived.NumericValue,
                    DeviationLimits.LimitLow,
                    DeviationLimits.LimitHigh
                );

                if (sample.NumericValue <= interpolatedLowLimit)
                {
                    // <= low limit
                    reasonCode = ReasonCodes.PassDeviationLimitLowExceeded;
                    return true;
                }

                if (sample.NumericValue >= interpolatedHighLimit)
                {
                    // >= high limit
                    reasonCode = ReasonCodes.PassDeviationLimitHighExceeded;
                    return true;
                }

                reasonCode = ReasonCodes.FailInsideLimits;
                (var computedLowLimit, var computedHighLimit) = ComputeDeviationLimitsForSample(sample);
                var restrictedLimits = GetRestrictedDeviationLimits(interpolatedLowLimit, interpolatedHighLimit, computedLowLimit, computedHighLimit);
                DeviationLimits = new DeviationLimits(restrictedLimits.LowLimit, restrictedLimits.HighLimit);
            }

            return false;
        }


        /// <inheritdoc/>
        protected override async ValueTask<DataFilterWriteResult> ApplyFilterAsync(DataCoreTagValue sample, CancellationToken cancellationToken)
        {
            try
            {
                var pass = PassesFilter(sample, out var reasonCode);

                _previousLastReceived = LastReceived;
                LastReceived = sample;

                if (!pass)
                {
                    return new DataFilterWriteResult(false, reasonCode, null);
                }

                var samplesToEmit = new List<DataCoreTagValue>(2);

                // Normally, the compression filter only emits the sample received immediately
                // prior to the sample that passed the filter tests. However, in some circumstances
                // we will emit the last-received sample instead of or as well as the the
                // previously-received sample.

                void EmitLatest()
                {
                    samplesToEmit.Add(LastReceived);
                    LastEmitted = LastReceived;
                }

                void EmitPrevious()
                {
                    if (_previousLastReceived != null && _previousLastReceived != LastEmitted)
                    {
                        samplesToEmit.Add(_previousLastReceived);
                        LastEmitted = _previousLastReceived;
                        _previousLastReceived = null;
                    }
                }

                switch (reasonCode)
                {
                    case ReasonCodes.PassInitialSample:
                        EmitLatest();
                        break;
                    case ReasonCodes.PassMaximumResampleLimitExceeded:
                    case ReasonCodes.PassQualityChange:
                    case ReasonCodes.PassTransitionFromNaN:
                    case ReasonCodes.PassTransitionToNaN:
                        EmitPrevious();
                        EmitLatest();
                        break;
                    default:
                        EmitPrevious();
                        break;
                }

                if (samplesToEmit.Count > 0)
                {
                    ResetDeviationLimits();
                }

                return new DataFilterWriteResult(true, reasonCode, samplesToEmit);
            }
            finally
            {
                if (!cancellationToken.IsCancellationRequested && _settings.OnStateUpdated != null)
                {
                    await _settings.OnStateUpdated(LastReceived, DeviationLimits, cancellationToken).ConfigureAwait(false);
                }
            }
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
            /// The sample value transitioned from <see cref="double.NaN"/> to a valid numeric value.
            /// </summary>
            public const byte PassTransitionFromNaN = 4;

            /// <summary>
            /// The sample transitioned from a valid numeric value to <see cref="double.NaN"/>.
            /// </summary>
            public const byte PassTransitionToNaN = 5;

            /// <summary>
            /// The computed deviation limits were <see cref="double.NaN"/>.
            /// </summary>
            public const byte PassNaNLimit = 6;

            /// <summary>
            /// The sample value was less than or equal to the low deviation limit.
            /// </summary>
            public const byte PassDeviationLimitLowExceeded = 7;

            /// <summary>
            /// The sample value was greater than or equal to the high deviation limit.
            /// </summary>
            public const byte PassDeviationLimitHighExceeded = 8;

            /// <summary>
            /// The timestamp of the sample was the same or earlier than the last-received sample.
            /// </summary>
            public const byte FailOutOfOrderTimestamp = 9;

            /// <summary>
            /// The sample was received immediately after the initial value, and this sample is 
            /// always rejected.
            /// </summary>
            public const byte FailSecondSample = 10;

            /// <summary>
            /// The sample value was inside the computed deviation limits.
            /// </summary>
            public const byte FailInsideLimits = 11;

            /// <summary>
            /// The minimum resample limit for the filter was not exceeded.
            /// </summary>
            public const byte FailMinimumResampleLimitNotExceeded = 12;

        }

    }
}
