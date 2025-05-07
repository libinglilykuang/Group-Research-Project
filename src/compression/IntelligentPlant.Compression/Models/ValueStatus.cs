namespace IntelligentPlant.Compression.Models
{
    /// <summary>
    /// Describes the quality status for a value.
    /// </summary>
    public enum ValueStatus
    {
        /// <summary>
        /// The value has bad quality.
        /// </summary>
        Bad = 0,
        /// <summary>
        /// The value has uncertain/questionable quality.
        /// </summary>
        Uncertain = 64,
        /// <summary>
        /// The value has good quality.
        /// </summary>
        Good = 192
    }
}
