namespace IntelligentPlant.Compression.DataFilters
{

    /// <summary>
    /// Describes absolute deviation limits used by a data filter.
    /// </summary>
    public readonly struct DeviationLimits : IEquatable<DeviationLimits>
    {

        /// <summary>
        /// The low limit.
        /// </summary>
        public double LimitLow { get; }

        /// <summary>
        /// The high limit.
        /// </summary>
        public double LimitHigh { get; }


        /// <summary>
        /// Creates a new <see cref="DeviationLimits"/> instance.
        /// </summary>
        /// <param name="low">
        ///   The low limit.
        /// </param>
        /// <param name="high">
        ///   The high limit.
        /// </param>
        public DeviationLimits(double low, double high)
        {
            LimitLow = low;
            LimitHigh = high;
        }


        /// <inheritdoc/>
        public override int GetHashCode()
        {
            return HashCode.Combine(LimitLow, LimitHigh);
        }


        /// <inheritdoc/>
        public override bool Equals(object obj)
        {
            if (obj is DeviationLimits limits)
            {
                return Equals(limits);
            }

            return false;
        }


        /// <inheritdoc/>
        public bool Equals(DeviationLimits other)
        {
            return LimitLow == other.LimitLow && LimitHigh == other.LimitHigh;
        }

    }
}
