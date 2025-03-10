using IntelligentPlant.Compression.Models;

namespace IntelligentPlant.Compression.DataFilters
{

    /// <summary>
    /// The result of a write to a data filter.
    /// </summary>
    public readonly struct DataFilterWriteResult
    {

        /// <summary>
        /// Specifies if the sample passed or failed the filter's tests.
        /// </summary>
        public bool Pass { get; }

        /// <summary>
        /// The reason code that describes why the sample passed or failed the filter's tests.
        /// </summary>
        /// <remarks>
        ///   Reason codes are filter-specific. Use the <see cref="Pass"/> property to determine 
        ///   if a sample passed or failed the filter's tests.
        /// </remarks>
        public byte ReasonCode { get; }

        /// <summary>
        /// The samples that will be passed to the next filter in the pipeline as a result of the 
        /// sample that was written.
        /// </summary>
        /// <remarks>
        ///   Note that output samples are only sent downstream if <see cref="Pass"/> is 
        ///   <see langword="true"/>.
        /// </remarks>
        public IEnumerable<DataCoreTagValue> OutputSamples { get; }


        /// <summary>
        /// Creates a new <see cref="DataFilterWriteResult"/> instance.
        /// </summary>
        /// <param name="pass">
        ///   Specifies if the sample passed or failed the filter's tests.
        /// </param>
        /// <param name="reasonCode">
        ///   The reason code that describes why the sample passed or failed the filter's tests.
        /// </param>
        /// <param name="outputSamples">
        ///   The samples that should be written to the next filter in the pipeline when 
        ///   <paramref name="pass"/> is <see langword="true"/>.
        /// </param>
        public DataFilterWriteResult(bool pass, byte reasonCode, IEnumerable<DataCoreTagValue> outputSamples)
        {
            Pass = pass;
            ReasonCode = reasonCode;
            OutputSamples = outputSamples;
        }

    }

}
