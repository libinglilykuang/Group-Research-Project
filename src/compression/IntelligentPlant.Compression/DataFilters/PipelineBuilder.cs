using IntelligentPlant.Compression.Models;

namespace IntelligentPlant.Compression.DataFilters
{

    /// <summary>
    /// Builds <see cref="Pipeline"/> instances.
    /// </summary>
    public sealed class PipelineBuilder
    {

        /// <summary>
        /// The pipeline identifier.
        /// </summary>
        private string _id;

        /// <summary>
        /// The factories that will construct the data filters for the pipeline.
        /// </summary>
        private readonly HashSet<DataFilterFactory> _factories = new HashSet<DataFilterFactory>();

        /// <summary>
        /// The default receivers when the pipeline emits values.
        /// </summary>
        private readonly HashSet<PipelineReceiver> _pipelineReceivers = new HashSet<PipelineReceiver>();

        /// <summary>
        /// Custom pipeline properties.
        /// </summary>
        private readonly Dictionary<string, object> _properties = new Dictionary<string, object>(StringComparer.OrdinalIgnoreCase);


        /// <summary>
        /// Sets the identifier for the pipeline.
        /// </summary>
        /// <param name="id">
        ///   The identifier.
        /// </param>
        /// <returns>
        ///   The <see cref="PipelineBuilder"/>.
        /// </returns>
        public PipelineBuilder WithIdentifier(string id)
        {
            _id = id;
            return this;
        }


        /// <summary>
        /// Adds a value change filter to the pipeline.
        /// </summary>
        /// <param name="settings">
        ///   The value change filter settings.
        /// </param>
        /// <returns>
        ///   The <see cref="PipelineBuilder"/>.
        /// </returns>
        /// <exception cref="ArgumentNullException">
        ///   <paramref name="settings"/> is <see langword="null"/>.
        /// </exception>
        public PipelineBuilder WithValueChangeFilter(ValueChangeFilterSettings settings)
        {
            if (settings == null)
            {
                throw new ArgumentNullException(nameof(settings));
            }

            return WithDataFilterFactory((pipeline, next) => new ValueChangeFilter(pipeline, next, settings));
        }


        /// <summary>
        /// Adds an exception filter to the pipeline.
        /// </summary>
        /// <param name="settings">
        ///   The exception filter settings.
        /// </param>
        /// <returns>
        ///   The <see cref="PipelineBuilder"/>.
        /// </returns>
        /// <exception cref="ArgumentNullException">
        ///   <paramref name="settings"/> is <see langword="null"/>.
        /// </exception>
        public PipelineBuilder WithExceptionFilter(ExceptionFilterSettings settings)
        {
            if (settings == null)
            {
                throw new ArgumentNullException(nameof(settings));
            }

            return WithDataFilterFactory((pipeline, next) => new ExceptionFilter(pipeline, next, settings));
        }


        /// <summary>
        /// Adds a compression filter to the pipeline.
        /// </summary>
        /// <param name="settings">
        ///   The compression filter settings.
        /// </param>
        /// <returns>
        ///   The <see cref="PipelineBuilder"/>.
        /// </returns>
        /// <exception cref="ArgumentNullException">
        ///   <paramref name="settings"/> is <see langword="null"/>.
        /// </exception>
        public PipelineBuilder WithCompressionFilter(CompressionFilterSettings settings)
        {
            if (settings == null)
            {
                throw new ArgumentNullException(nameof(settings));
            }

            return WithDataFilterFactory((pipeline, next) => new CompressionFilter(pipeline, next, settings));
        }


        /// <summary>
        /// Adds a filter to the pipeline that uses a callback to determine if an incoming sample 
        /// is accepted or rejected.
        /// </summary>
        /// <param name="callback">
        ///   The callback.
        /// </param>
        /// <returns>
        ///   The <see cref="PipelineBuilder"/>.
        /// </returns>
        /// <exception cref="ArgumentNullException">
        ///   <paramref name="callback"/> is <see langword="null"/>.
        /// </exception>
        public PipelineBuilder WithCallbackFilter(Func<DataCoreTagValue, bool> callback)
        {
            if (callback == null)
            {
                throw new ArgumentNullException(nameof(callback));
            }
            return WithDataFilterFactory((pipeline, next) => new CallbackFilter(pipeline, next, callback));
        }


        /// <summary>
        /// Adds a filter to the pipeline that uses a callback to determine if an incoming sample 
        /// is accepted or rejected.
        /// </summary>
        /// <param name="callback">
        ///   The callback.
        /// </param>
        /// <returns>
        ///   The <see cref="PipelineBuilder"/>.
        /// </returns>
        /// <exception cref="ArgumentNullException">
        ///   <paramref name="callback"/> is <see langword="null"/>.
        /// </exception>
        public PipelineBuilder WithCallbackFilter(Func<DataCoreTagValue, CancellationToken, ValueTask<bool>> callback)
        {
            if (callback == null)
            {
                throw new ArgumentNullException(nameof(callback));
            }
            return WithDataFilterFactory((pipeline, next) => new CallbackFilter(pipeline, next, callback));
        }


        /// <summary>
        /// Adds a data filter to the pipeline that will be built using the specified factory 
        /// delegate.
        /// </summary>
        /// <param name="factory">
        ///   The factory delegate.
        /// </param>
        /// <returns>
        ///   The <see cref="PipelineBuilder"/>.
        /// </returns>
        /// <exception cref="ArgumentNullException">
        ///   <paramref name="factory"/> is <see langword="null"/>.
        /// </exception>
        public PipelineBuilder WithDataFilterFactory(DataFilterFactory factory)
        {
            if (factory == null)
            {
                throw new ArgumentNullException(nameof(factory));
            }

            _factories.Add(factory);
            return this;
        }


        /// <summary>
        /// Registers a delegate that will be invoked when the pipeline emits samples.
        /// </summary>
        /// <param name="callback">
        ///   The delegate.
        /// </param>
        /// <returns>
        ///   The <see cref="PipelineBuilder"/>.
        /// </returns>
        /// <exception cref="ArgumentNullException">
        ///   <paramref name="callback"/> is <see langword="null"/>.
        /// </exception>
        /// <remarks>
        ///   The <paramref name="callback"/> will be automatically subscribed to the pipeline's 
        ///   <see cref="Pipeline.SampleEmitted"/> event.
        /// </remarks>
        public PipelineBuilder WithDestination(PipelineReceiver callback)
        {
            if (callback == null)
            {
                throw new ArgumentNullException(nameof(callback));
            }

            _pipelineReceivers.Add(callback);
            return this;
        }


        /// <summary>
        /// Adds a custom property to the pipeline.
        /// </summary>
        /// <param name="name">
        ///   The property name.
        /// </param>
        /// <param name="value">
        ///   The property value.
        /// </param>
        /// <returns>
        ///   The <see cref="PipelineBuilder"/>.
        /// </returns>
        /// <exception cref="ArgumentOutOfRangeException">
        ///   <paramref name="name"/> is <see langword="null"/> or white space.
        /// </exception>
        public PipelineBuilder WithProperty<T>(string name, T value)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                throw new ArgumentOutOfRangeException(nameof(name));
            }

            _properties[name] = value;
            return this;
        }


        /// <summary>
        /// Builds a new <see cref="Pipeline"/>.
        /// </summary>
        /// <returns>
        ///   A new <see cref="Pipeline"/> instance.
        /// </returns>
        public Pipeline Build()
        {
            return new Pipeline(_id, _factories.ToArray(), _pipelineReceivers.ToArray(), _properties);
        }

    }
}
