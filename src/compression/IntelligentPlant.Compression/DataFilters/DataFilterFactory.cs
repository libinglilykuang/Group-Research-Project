namespace IntelligentPlant.Compression.DataFilters
{

    /// <summary>
    /// A factory delegate for creating <see cref="DataFilter"/> instances.
    /// </summary>
    /// <param name="pipeline">
    ///   The <see cref="Pipeline"/> that the data filter belongs to. Can be <see langword="null"/>.
    /// </param>
    /// <param name="next">
    ///   The data filter to write values to when they are emitted from the filter built by the 
    ///   factory. Can be <see langword="null"/>.
    /// </param>
    /// <returns>
    ///   A new <see cref="DataFilter"/> instance.
    /// </returns>
    public delegate DataFilter DataFilterFactory(Pipeline pipeline, DataFilter next);

}
