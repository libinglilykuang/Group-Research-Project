using IntelligentPlant.Compression.Models;
using System.Collections.ObjectModel;

namespace IntelligentPlant.Compression.DataFilters
{

    /// <summary>
    /// A pipeline that can filter out incoming samples based on the data filters configured in 
    /// the pipeline.
    /// </summary>
    /// <remarks>
    ///   Use <see cref="PipelineBuilder"/> to create new <see cref="Pipeline"/> instances.
    /// </remarks>
    /// <seealso cref="PipelineBuilder"/>
    public sealed class Pipeline : IDisposable
    {

        /// <summary>
        /// Specifies if the pipeline has been disposed.
        /// </summary>
        private bool _disposed;

        /// <summary>
        /// Cancellation token source that requests cancellation when the pipeline is disposed.
        /// </summary>
        private readonly CancellationTokenSource _disposedTokenSource = new CancellationTokenSource();

        /// <summary>
        /// The first <see cref="DataFilter"/> in the pipeline.
        /// </summary>
        private readonly DataFilter _pipeline;

        /// <summary>
        /// Lock for calling <see cref="WriteAsync"/>
        /// </summary>
        private readonly Nito.AsyncEx.AsyncLock _writeLock = new Nito.AsyncEx.AsyncLock();

        /// <summary>
        /// Custom properties associated with the pipeline.
        /// </summary>
        private readonly IReadOnlyDictionary<string, object> _properties;

        /// <summary>
        /// The number of samples received by the pipeline.
        /// </summary>
        private long _samplesReceived;

        /// <summary>
        /// The number of samples emitted by the pipeline.
        /// </summary>
        private long _samplesEmitted;

        /// <summary>
        /// The identifier for the pipeline.
        /// </summary>
        public string Id { get; }

        /// <summary>
        /// The total number of samples received by the pipeline.
        /// </summary>
        public long SamplesReceived => _samplesReceived;

        /// <summary>
        /// The number of samples emitted by the pipeline.
        /// </summary>
        public long SamplesEmitted => _samplesEmitted;

        /// <summary>
        /// The last sample that was received by the pipeline.
        /// </summary>
        public DataCoreTagValue LastReceived { get; private set; }

        /// <summary>
        /// The last sample that was emitted by the pipeline.
        /// </summary>
        public DataCoreTagValue LastEmitted { get; private set; }

        /// <summary>
        /// The efficiency of the pipeline.
        /// </summary>
        /// <remarks>
        ///   The pipeline efficiency describes how effectively the pipeline filters out 
        ///   samples that it has received. 100% efficiency implies that the pipeline has not 
        ///   emitted any samples whereas 0% efficiency implies that the pipeline has emitted 
        ///   the same number of samples that it has received.
        /// </remarks>
        public double Efficiency => _samplesReceived == 0
            ? -1
            : 100 - (double)_samplesEmitted / _samplesReceived * 100;

        /// <summary>
        /// Raised when a sample reaches the end of the pipeline.
        /// </summary>
        public event PipelineReceiver SampleEmitted;


        /// <summary>
        /// Creates a new <see cref="Pipeline"/> instance.
        /// </summary>
        /// <param name="id">
        ///   The identifier for the pipeline.
        /// </param>
        /// <param name="factories">
        ///   The data filter factories to use when building the pipeline.
        /// </param>
        /// <param name="defaultReceivers">
        ///   The default recipients of values emitted by the pipeline. Items in this collection 
        ///   will be automatically subscribed to the <see cref="SampleEmitted"/> event.
        /// </param>
        /// <param name="properties">
        ///   Custom properties associated with the pipeline.
        /// </param>
        internal Pipeline(string id, IEnumerable<DataFilterFactory> factories, IEnumerable<PipelineReceiver> defaultReceivers, IDictionary<string, object> properties)
        {
            Id = string.IsNullOrWhiteSpace(id)
                ? Guid.NewGuid().ToString()
                : id;

            var termination = new PipelineTerminator(this);

            var factoriesSanitised = factories?.ToArray() ?? Array.Empty<DataFilterFactory>();
            if (factoriesSanitised.Length == 0)
            {
                // No data filters specified so just use the pipeline terminator.
                _pipeline = termination;
            }
            else
            {
                // One or more data filters have been specified. We will reverse and then
                // aggregate the data filters so that each filter writes values to the next filter
                // in the chain until they reach the terminator.
                _pipeline = factoriesSanitised.Reverse().Aggregate((DataFilter)termination, (next, factory) => factory.Invoke(this, next));
            }

            if (defaultReceivers != null)
            {
                foreach (var item in defaultReceivers)
                {
                    if (item == null)
                    {
                        continue;
                    }

                    SampleEmitted += item;
                }
            }

            _properties = properties == null
                ? new ReadOnlyDictionary<string, object>(new Dictionary<string, object>())
                : new ReadOnlyDictionary<string, object>(properties);
        }


        /// <summary>
        /// Tries to get a custom pipeline property.
        /// </summary>
        /// <typeparam name="T">
        ///   The property type.
        /// </typeparam>
        /// <param name="name">
        ///   The property name.
        /// </param>
        /// <param name="value">
        ///   The property value.
        /// </param>
        /// <returns>
        ///   <see langword="true"/> if the property was found or <see langword="false"/> 
        ///   otherwise.
        /// </returns>
        public bool TryGetProperty<T>(string name, out T value)
        {
            value = default;

            if (string.IsNullOrWhiteSpace(name) || !_properties.TryGetValue(name, out var o) || !(o is T val))
            {
                return false;
            }

            value = val;
            return true;
        }


        /// <summary>
        /// Writes a sample to the pipeline.
        /// </summary>
        /// <param name="sample">
        ///   The sample.
        /// </param>
        /// <param name="cancellationToken">
        ///   The cancellation token for the operation.
        /// </param>
        /// <returns>
        ///   A <see cref="ValueTask"/> that represents the write operation.
        /// </returns>
        /// <exception cref="ObjectDisposedException">
        ///   The <see cref="Pipeline"/> has been disposed.
        /// </exception>
        /// <exception cref="ArgumentNullException">
        ///   <paramref name="sample"/> is <see langword="null"/>.
        /// </exception>
        public async ValueTask WriteAsync(DataCoreTagValue sample, CancellationToken cancellationToken = default)
        {
            if (_disposed)
            {
                throw new ObjectDisposedException(GetType().FullName);
            }
            if (sample == null)
            {
                throw new ArgumentNullException(nameof(sample));
            }

            using (var ctSource = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken, _disposedTokenSource.Token))
            using (await _writeLock.LockAsync(ctSource.Token).ConfigureAwait(false))
            {
                if (LastReceived != null && sample.UtcSampleTime <= LastReceived.UtcSampleTime)
                {
                    return;
                }

                await _pipeline.WriteAsync(sample, ctSource.Token).ConfigureAwait(false);
                LastReceived = sample;
                Interlocked.Increment(ref _samplesReceived);
            }
        }


        /// <summary>
        /// Notifies subscribers about newly-emitted values.
        /// </summary>
        /// <param name="sample">
        ///   The sample.
        /// </param>
        /// <param name="cancellationToken">
        ///   The cancellation token for the operation.
        /// </param>
        /// <returns>
        ///   A <see cref="ValueTask"/> that will invoke the <see cref="SampleEmitted"/> event.
        /// </returns>
        private async ValueTask EmitAsync(DataCoreTagValue sample, CancellationToken cancellationToken)
        {
            if (_disposed)
            {
                return;
            }

            LastEmitted = sample;
            Interlocked.Increment(ref _samplesEmitted);
            if (SampleEmitted != null)
            {
                await SampleEmitted(sample, cancellationToken).ConfigureAwait(false);
            }
        }


        /// <inheritdoc/>
        public void Dispose()
        {
            if (_disposed)
            {
                return;
            }

            _disposedTokenSource.Cancel();
            _disposedTokenSource.Dispose();
            _disposed = true;
        }


        /// <summary>
        /// <see cref="DataFilter"/> that acts as the termination point for the pipeline.
        /// </summary>
        private class PipelineTerminator : DataFilter
        {

            /// <summary>
            /// Creates a new <see cref="PipelineTerminator"/> instance.
            /// </summary>
            /// <param name="pipeline">
            ///   The <see cref="Pipeline"/> to publish samples to.
            /// </param>
            public PipelineTerminator(Pipeline pipeline) : base(pipeline, null) { }


            /// <inheritdoc/>
            protected override ValueTask<DataFilterWriteResult> ApplyFilterAsync(DataCoreTagValue sample, CancellationToken cancellationToken)
            {
                // Always pass.
                return new ValueTask<DataFilterWriteResult>(new DataFilterWriteResult(true, 0, new[] { sample }));
            }


            /// <inheritdoc/>
            protected override async ValueTask EmitAsync(IEnumerable<DataCoreTagValue> samples, CancellationToken cancellationToken)
            {
                if (samples == null)
                {
                    return;
                }

                // Write the samples to the pipeline's output receiver.
                foreach (var sample in samples)
                {
                    if (sample == null)
                    {
                        continue;
                    }
                    await Pipeline.EmitAsync(sample, cancellationToken).ConfigureAwait(false);
                }
            }

        }

    }
}
