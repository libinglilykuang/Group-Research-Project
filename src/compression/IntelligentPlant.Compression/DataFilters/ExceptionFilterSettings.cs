namespace IntelligentPlant.Compression.DataFilters
{

    /// <summary>
    /// Settings for an <see cref="ExceptionFilter"/>.
    /// </summary>
    public sealed class ExceptionFilterSettings : DataFilterSettings
    {

        /// <summary>
        /// The deviation type used when calculating absolute deviation limits.
        /// </summary>
        public DeviationType DeviationType { get; set; }

        /// <summary>
        /// The deviation quantity used when calculating absolute deviation limits.
        /// </summary>
        public double DeviationLimit { get; set; }

    }
}
