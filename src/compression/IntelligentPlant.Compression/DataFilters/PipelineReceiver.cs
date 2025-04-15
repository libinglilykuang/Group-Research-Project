using IntelligentPlant.Compression.Models;

namespace IntelligentPlant.Compression.DataFilters
{

    /// <summary>
    /// A <see cref="PipelineReceiver"/> is used by a <see cref="Pipeline"/> to emit 
    /// values that pass through all filters in the pipeline.
    /// </summary>
    /// <param name="sample">
    ///   The emitted sample.
    /// </param>
    /// <param name="cancellationToken">
    ///   The cancellation token for the operation.
    /// </param>
    /// <returns>
    ///   A <see cref="ValueTask"/> that represents the operation.
    /// </returns>
    public delegate ValueTask PipelineReceiver(DataCoreTagValue sample, CancellationToken cancellationToken);

}
