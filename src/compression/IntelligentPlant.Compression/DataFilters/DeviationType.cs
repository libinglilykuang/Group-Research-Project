namespace IntelligentPlant.Compression.DataFilters
{

    /// <summary>
    /// Describes the way that an absolute deviation limit for a data filter should be derived 
    /// from an associated magnitude.
    /// </summary>
    public enum DeviationType
    {

        /// <summary>
        /// The magnitude represents an absolute value change from the previous value to pass the 
        /// data filter's tests.
        /// </summary>
        Absolute,

        /// <summary>
        /// The magnitude represents a relative value change from the previous value to pass the 
        /// data filter's tests that is calculated as a fraction of the last-emitted sample.
        /// </summary>
        Fraction,

        /// <summary>
        /// The magnitude represents a relative value change from the previous value to pass the 
        /// data filter's tests that is calculated as a percentage of the last-emitted sample.
        /// </summary>
        /// <remarks>
        ///   <see cref="Percent"/> and <see cref="Percentage"/> are interchageable.
        /// </remarks>
        Percentage,

        /// <summary>
        /// The magnitude represents a relative value change from the previous value to pass the 
        /// data filter's tests that is calculated as a percentage of the last-emitted sample.
        /// </summary>
        /// <remarks>
        ///   <see cref="Percent"/> and <see cref="Percentage"/> are interchageable.
        /// </remarks>
        Percent = Percentage

    }

}
