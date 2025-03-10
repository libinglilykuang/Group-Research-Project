using IntelligentPlant.Compression.Models;

namespace IntelligentPlant.Compression.DataFilters
{

    /// <summary>
    /// <see cref="DataFilter"/> that checks for changes in sample value or quality.
    /// </summary>
    public sealed class ValueChangeFilter : DataFilter
    {

        /// <summary>
        /// The data filter settings.
        /// </summary>
        private readonly ValueChangeFilterSettings _settings;

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
        /// Creates a new <see cref="ValueChangeFilter"/> instance.
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
        internal ValueChangeFilter(Pipeline pipeline, DataFilter next, ValueChangeFilterSettings settings) : base(pipeline, next)
        {
            _settings = settings ?? throw new ArgumentNullException(nameof(settings));
            LastEmitted = _settings.LastEmittedSample;
            LastReceived = _settings.LastReceivedSample;
        }


        /// <summary>
        /// Creates a new <see cref="ValueChangeFilter"/> instance without an associated <see cref="Pipeline"/>.
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
        public ValueChangeFilter(DataFilter next, ValueChangeFilterSettings settings)
            : this(null, next, settings) { }


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
                // No previous value.
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

            // Check for change in numeric or text value.
            var valueChange = LastEmitted.NumericValue != sample.NumericValue || !string.Equals(LastEmitted.TextValue, sample.TextValue, StringComparison.Ordinal);

            if (valueChange)
            {
                reasonCode = ReasonCodes.PassValueChange;
                return true;
            }

            reasonCode = ReasonCodes.FailNoValueChange;
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
            /// The value of the sample was different to the last-received sample.
            /// </summary>
            public const byte PassValueChange = 4;

            /// <summary>
            /// The timestamp of the sample was the same or earlier than the last-received sample.
            /// </summary>
            public const byte FailOutOfOrderTimestamp = 5;

            /// <summary>
            /// The value of the sample was the same as the last-received sample.
            /// </summary>
            public const byte FailNoValueChange = 6;

            /// <summary>
            /// The minimum resample limit for the filter was not exceeded.
            /// </summary>
            public const byte FailMinimumResampleLimitNotExceeded = 7;

        }

    }
}
