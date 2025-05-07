using IntelligentPlant.Compression.Models;

namespace IntelligentPlant.Compression.DataFilters
{

    /// <summary>
    /// <see cref="DataFilter"/> that accepts or rejects incoming samples based on a callback.
    /// </summary>
    public class CallbackFilter : DataFilter
    {

        /// <summary>
        /// The callback.
        /// </summary>
        private readonly Func<DataCoreTagValue, CancellationToken, ValueTask<bool>> _callback;


        /// <summary>
        /// Creates a new <see cref="CallbackFilter"/> onstance.
        /// </summary>
        /// <param name="pipeline">
        ///   The <see cref="Pipeline"/> that the data filter belongs to.
        /// </param>
        /// <param name="next">
        ///   The next data filter in the pipeline.
        /// </param>
        /// <param name="callback">
        ///   The callback that determines if incoming samples are accepted or rejected by the 
        ///   filter.
        /// </param>
        /// <exception cref="ArgumentNullException">
        ///   <paramref name="callback"/> is <see langword="null"/>.
        /// </exception>
        internal CallbackFilter(Pipeline pipeline, DataFilter next, Func<DataCoreTagValue, CancellationToken, ValueTask<bool>> callback)
            : base(pipeline, next)
        {
            _callback = callback ?? throw new ArgumentNullException(nameof(callback));
        }


        /// <summary>
        /// Creates a new <see cref="CallbackFilter"/> onstance.
        /// </summary>
        /// <param name="pipeline">
        ///   The <see cref="Pipeline"/> that the data filter belongs to.
        /// </param>
        /// <param name="next">
        ///   The next data filter in the pipeline.
        /// </param>
        /// <param name="callback">
        ///   The callback that determines if incoming samples are accepted or rejected by the 
        ///   filter.
        /// </param>
        /// <exception cref="ArgumentNullException">
        ///   <paramref name="callback"/> is <see langword="null"/>.
        /// </exception>
        internal CallbackFilter(Pipeline pipeline, DataFilter next, Func<DataCoreTagValue, bool> callback)
            : base(pipeline, next)
        {
            if (callback == null)
            {
                throw new ArgumentNullException(nameof(callback));
            }
            _callback = (sample, ct) => new ValueTask<bool>(callback.Invoke(sample));
        }


        /// <inheritdoc/>
        protected override async ValueTask<DataFilterWriteResult> ApplyFilterAsync(DataCoreTagValue sample, CancellationToken cancellationToken)
        {
            var pass = await _callback.Invoke(sample, cancellationToken).ConfigureAwait(false);
            return new DataFilterWriteResult(pass, 0, pass ? new[] { sample } : null);
        }

    }
}
