using IntelligentPlant.Compression.Models;

namespace IntelligentPlant.Compression.DataFilters
{

    /// <summary>
    /// Base settings for a <see cref="DataFilter"/>.
    /// </summary>
    public abstract class DataFilterSettings
    {

        /// <summary>
        /// The minimum resample limit for the filter.
        /// </summary>
        /// <remarks>
        ///   If greater than <see cref="TimeSpan.Zero"/>, samples will always fail the data 
        ///   filter's tests if the time between the last-emitted sample and the incoming sample is 
        ///   less than this limit.
        /// </remarks>
        public TimeSpan MinimumResampleLimit { get; set; }

        /// <summary>
        /// The maximum resample limit for the filter.
        /// </summary>
        /// <remarks>
        ///   If greater than <see cref="TimeSpan.Zero"/>, samples will always pass the data 
        ///   filter's tests if the time between the last-emitted sample and the incoming sample is
        ///   greater than or equal to than this limit.
        /// </remarks>
        public TimeSpan MaximumResampleLimit { get; set; }

        /// <summary>
        /// The initial last-emitted sample for the filter.
        /// </summary>
        public DataCoreTagValue LastEmittedSample { get; set; }

        /// <summary>
        /// The initial last-received sample for the filter.
        /// </summary>
        public DataCoreTagValue LastReceivedSample { get; set; }

    }
}
