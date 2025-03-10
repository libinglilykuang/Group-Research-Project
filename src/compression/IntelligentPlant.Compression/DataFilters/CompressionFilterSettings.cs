using IntelligentPlant.Compression.Models;

namespace IntelligentPlant.Compression.DataFilters
{

    /// <summary>
    /// Settings for a <see cref="CompressionFilter"/>.
    /// </summary>
    public sealed class CompressionFilterSettings : DataFilterSettings
    {

        /// <summary>
        /// The deviation type used when calculating absolute deviation limits.
        /// </summary>
        public DeviationType DeviationType { get; set; }

        /// <summary>
        /// The deviation quantity used when calculating absolute deviation limits.
        /// </summary>
        public double DeviationLimit { get; set; }

        /// <summary>
        /// The initial absolute deviation limits to use. If not specified, initial limits will be 
        /// computed.
        /// </summary>
        public DeviationLimits? InitialState { get; set; }

        /// <summary>
        /// A callback that is invoked each time the deviation limits for the filter are updated.
        /// </summary>
        /// <remarks>
        ///   
        /// <para>
        /// The parameters passed to the callback are:
        /// </para>
        /// 
        /// <list type="bullet">
        ///   <item>The last sample received by the filter.</item>
        ///   <item>The deviation limits that were recalculated after the last sample was received.</item>
        ///   <item>A cancellation token for the callback operation.</item>
        /// </list>
        ///    
        /// </remarks>
        public Func<DataCoreTagValue, DeviationLimits, CancellationToken, ValueTask> OnStateUpdated { get; set; }

    }
}
