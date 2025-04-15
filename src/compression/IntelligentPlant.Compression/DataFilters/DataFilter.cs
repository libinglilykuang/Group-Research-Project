using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

using IntelligentPlant.Compression.Models;

namespace IntelligentPlant.Compression.DataFilters
{

    /// <summary>
    /// Base class for a data filter in a <see cref="Pipeline"/>.
    /// </summary>
    public abstract class DataFilter
    {

        /// <summary>
        /// The <see cref="Pipeline"/> that the data filter belongs to.
        /// </summary>
        public Pipeline Pipeline { get; }

        /// <summary>
        /// The next data filter in the pipeline.
        /// </summary>
        public DataFilter Next { get; }


        /// <summary>
        /// Creates a new <see cref="DataFilter"/> instance.
        /// </summary>
        /// <param name="pipeline">
        ///   The <see cref="Pipeline"/> that the data filter belongs to.
        /// </param>
        /// <param name="next">
        ///   The next data filter in the pipeline.
        /// </param>
        /// <remarks>
        ///   If <paramref name="next"/> is <see langword="null"/>, the default implementation of 
        ///   <see cref="EmitAsync"/> will do nothing.
        /// </remarks>
        protected DataFilter(Pipeline pipeline, DataFilter next)
        {
            Pipeline = pipeline;
            Next = next;
        }


        /// <summary>
        /// Writes a sample to the data filter.
        /// </summary>
        /// <param name="sample">
        ///   The sample.
        /// </param>
        /// <param name="cancellationToken">
        ///   The cancellation token for the operation.
        /// </param>
        /// <returns>
        ///   A <see cref="ValueTask{TResult}"/> that returns the <see cref="DataFilterWriteResult"/> 
        ///   for the operation.
        /// </returns>
        /// <exception cref="ArgumentNullException">
        ///   <paramref name="sample"/> is <see langword="null"/>.
        /// </exception>
        public async ValueTask<DataFilterWriteResult> WriteAsync(DataCoreTagValue sample, CancellationToken cancellationToken = default)
        {
            if (sample == null)
            {
                throw new ArgumentNullException(nameof(sample));
            }

            var result = await ApplyFilterAsync(sample, cancellationToken).ConfigureAwait(false);

            if (result.Pass && result.OutputSamples != null)
            {
                await EmitAsync(result.OutputSamples, cancellationToken).ConfigureAwait(false);
            }

            return result;
        }


        /// <summary>
        /// Applies the data filter's tests to the specified sample.
        /// </summary>
        /// <param name="sample">
        ///   The sample.
        /// </param>
        /// <param name="cancellationToken">
        ///   The cancellation token for the operation.
        /// </param>
        /// <returns>
        ///   A <see cref="ValueTask{TResult}"/> that returns a <see cref="DataFilterWriteResult"/> 
        ///   specifying if the sample passed or failed the data filter's tests.
        /// </returns>
        protected abstract ValueTask<DataFilterWriteResult> ApplyFilterAsync(DataCoreTagValue sample, CancellationToken cancellationToken);


        /// <summary>
        /// Emits the specified samples from the data filter.
        /// </summary>
        /// <param name="samples">
        ///   The samples to emit.
        /// </param>
        /// <param name="cancellationToken">
        ///   The cancellation token for the operation.
        /// </param>
        /// <returns>
        ///   A <see cref="ValueTask"/> that represents the operation.
        /// </returns>
        /// <remarks>
        ///   The default implementation of <see cref="EmitAsync"/> sends the <paramref name="samples"/> 
        ///   to the next data filter in the pipeline.
        /// </remarks>
        protected virtual async ValueTask EmitAsync(IEnumerable<DataCoreTagValue> samples, CancellationToken cancellationToken)
        {
            if (Next == null || samples == null)
            {
                return;
            }

            foreach (var sample in samples)
            {
                await Next.WriteAsync(sample, cancellationToken).ConfigureAwait(false);
            }
        }

    }
}
