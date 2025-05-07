using System.Globalization;

namespace IntelligentPlant.Compression.Models
{
    /// <summary>
    /// Describes a value change in a data source driver.
    /// </summary>
    /// <remarks>
    ///   
    /// <para>
    ///   Use <see cref="DataCoreTagValueBuilder"/> to create new <see cref="DataCoreTagValue"/> 
    ///   instances or use one of the following static methods:
    /// </para>
    /// 
    /// <list type="bullet">
    ///   <item><see cref="FromNumericValue"/></item>
    ///   <item><see cref="FromTextValue"/></item>
    ///   <item><see cref="FromDigitalStateValue"/></item>
    ///   <item><see cref="CreateErrorValue"/></item>
    ///   <item><see cref="CreateUnauthorizedValue"/></item>
    /// </list>
    /// 
    /// </remarks>
    /// <seealso cref="DataCoreTagValueBuilder"/>
    public class DataCoreTagValue : IEquatable<DataCoreTagValue>
    {

        /// <summary>
        /// Gets the name of the tag.
        /// </summary>
        public string TagName { get; }

        /// <summary>
        /// Gets the UTC sample time.
        /// </summary>
        public DateTime UtcSampleTime { get; }

        /// <summary>
        /// Gets the numeric value for the tag.
        /// </summary>
        public double NumericValue { get; }

        /// <summary>
        /// Gets a flag specifying if <see cref="NumericValue"/> is valid.  The property returns 
        /// <see langword="true"/> as long as <see cref="NumericValue"/> is not one of 
        /// <see cref="double.NaN"/>, <see cref="double.PositiveInfinity"/>, or 
        /// <see cref="double.NegativeInfinity"/>.
        /// </summary>
        public bool IsNumeric { get; }

        /// <summary>
        /// Gets the text value for the tag.
        /// </summary>
        /// <remarks>
        /// For digital tags, this field returns the name of the digital state.
        /// </remarks>
        public string TextValue { get; }

        /// <summary>
        /// Gets the quality status for the value.
        /// </summary>
        public ValueStatus Status { get; }

        /// <summary>
        /// Gets the unit of measure for the tag value.
        /// </summary>
        public string Unit { get; }

        /// <summary>
        /// Gets the notes associated with the value.
        /// </summary>
        public string Notes { get; private set; }

        /// <summary>
        /// Gets the error message associated with the value (e.g. if this is a calculated value and the calculation failed).
        /// </summary>
        public string Error { get; }

        /// <summary>
        /// Gets a flag indicating if the tag value contains an error message in the <see cref="Error"/> property.
        /// </summary>
        public bool HasError
        {
            get { return !string.IsNullOrWhiteSpace(Error); }
        }

        /// <summary>
        /// Gets custom properties associated with the value.
        /// </summary>
        public IDictionary<string, object> Properties { get; }

        /// <summary>
        /// Hash code for the object.
        /// </summary>
        private int? _hashCode;

        public DataCoreTagValue(string tagName, DateTime timeStamp, double value)
        {
            TagName = tagName;
            UtcSampleTime = timeStamp;
            NumericValue = value;
            TextValue = value.ToString();
            Status = ValueStatus.Good;
        }

        /// <summary>
        /// Gets the hash code for the object.
        /// </summary>
        /// <returns>
        /// The hash code.
        /// </returns>
        public override int GetHashCode()
        {
            return _hashCode ??= HashCode.Combine(TagName.ToUpperInvariant(), UtcSampleTime);
        }


        /// <summary>
        /// Tests if this object is equal to another <see cref="DataCoreTagValue"/>.
        /// </summary>
        /// <param name="other">The other object.</param>
        /// <returns>
        /// <see langword="true"/> if the objects are equivalent, otherwise <see langword="false"/>.
        /// </returns>
        public bool Equals(DataCoreTagValue other)
        {
            if (other == null)
            {
                return false;
            }

            return string.Equals(TagName, other.TagName, StringComparison.OrdinalIgnoreCase) &&
                   UtcSampleTime.Equals(other.UtcSampleTime) &&
                   NumericValue.Equals(other.NumericValue) &&
                   string.Equals(TextValue, other.TextValue) &&
                   Status == other.Status &&
                   string.Equals(Unit, other.Unit);
        }


        /// <summary>
        /// Tests if this object is equal to another object.
        /// </summary>
        /// <param name="obj">The other object.</param>
        /// <returns>
        /// <see langword="true"/> if the objects are equivalent, otherwise <see langword="false"/>.
        /// </returns>
        public override bool Equals(object obj)
        {
            return Equals(obj as DataCoreTagValue);
        }


        /// <summary>
        /// Creates a string representation of the value.
        /// </summary>
        /// <returns>
        /// A string representation of the value.
        /// </returns>
        public override string ToString()
        {
            return string.Format(CultureInfo.CurrentCulture, "{{ {0}, Timestamp={1:yyyy-MM-dd HH:mm:ss.fff}, Numeric Value={2}, Text Value=\"{3}\", Status={4}, Unit={5} }}", TagName, UtcSampleTime, NumericValue, TextValue, Status, Unit);
        }


        /// <summary>
        /// Updates the <see cref="Notes"/> property by concatenating the specified text to the existing notes for the value.
        /// </summary>
        /// <param name="notes">The additional notes.</param>
        internal void UpdateNotes(string notes)
        {
            if (string.IsNullOrWhiteSpace(notes))
            {
                return;
            }

            if (string.IsNullOrWhiteSpace(Notes))
            {
                Notes = notes;
                return;
            }

            Notes = $"{Notes}{Environment.NewLine}{notes}";
        }
    }


    /// <summary>
    /// Defines <see cref="IEqualityComparer{T}"/> implementations for <see cref="DataCoreTagValue"/> objects.
    /// </summary>
    public static class DataCoreTagValueComparer
    {

        /// <summary>
        /// Gets the default comparer.
        /// </summary>
        public static IEqualityComparer<DataCoreTagValue> Default { get; } = new DefaultDataCoreTagValueComparer();

        /// <summary>
        /// Gets a comparer that tests for equality based on tag name and UTC sample time.
        /// </summary>
        public static IEqualityComparer<DataCoreTagValue> SampleTime { get; } = new SampleTimeTagValueComparer();


        /// <summary>
        /// Default comparer.
        /// </summary>
        private class DefaultDataCoreTagValueComparer : IEqualityComparer<DataCoreTagValue>
        {

            /// <summary>
            /// Gets the hash code the the object.
            /// </summary>
            /// <param name="obj">The object.</param>
            /// <returns>
            /// The hash code.
            /// </returns>
            public int GetHashCode(DataCoreTagValue obj)
            {
                if (obj == null)
                {
                    throw new ArgumentNullException(nameof(obj));
                }

                return obj.GetHashCode();
            }


            /// <summary>
            /// Tests if the specified instances are equal.
            /// </summary>
            /// <param name="x">The first object.</param>
            /// <param name="y">The second object.</param>
            /// <returns>
            /// A flag that indicates if the objects are equal.
            /// </returns>
            public bool Equals(DataCoreTagValue x, DataCoreTagValue y)
            {
                if (x == null && y == null)
                {
                    return true;
                }

                if (x == null || y == null)
                {
                    return false;
                }

                return x.Equals(y);
            }

        }


        /// <summary>
        /// Comparer that tests for equality based on tag name and sample time.
        /// </summary>
        private class SampleTimeTagValueComparer : IEqualityComparer<DataCoreTagValue>
        {

            /// <summary>
            /// Gets the hash code the the object.
            /// </summary>
            /// <param name="obj">The object.</param>
            /// <returns>
            /// The hash code.
            /// </returns>
            public int GetHashCode(DataCoreTagValue obj)
            {
                if (obj == null)
                {
                    throw new ArgumentNullException(nameof(obj));
                }

                return obj.UtcSampleTime.GetHashCode();
            }


            /// <summary>
            /// Tests if the specified instances are equal.
            /// </summary>
            /// <param name="x">The first object.</param>
            /// <param name="y">The second object.</param>
            /// <returns>
            /// A flag that indicates if the objects are equal.
            /// </returns>
            public bool Equals(DataCoreTagValue x, DataCoreTagValue y)
            {
                if (x == null && y == null)
                {
                    return true;
                }

                if (x == null || y == null)
                {
                    return false;
                }

                if (GetHashCode(x) != GetHashCode(y))
                {
                    return false;
                }

                return x.UtcSampleTime == y.UtcSampleTime && string.Equals(x.TagName, y.TagName, StringComparison.OrdinalIgnoreCase);
            }

        }

    }

}
