using System;

// Mock compression algorithm
public class CompressionAlgorithm
{
    public string CompressData(string data, double? compressionRatio = null)
    {
        try
        {
            // Check if data is null
            if (data == null)
            {
                throw new ArgumentException("Input data cannot be null");
            }

            // Check if data is empty
            if (string.IsNullOrEmpty(data))
            {
                throw new ArgumentException("Input data cannot be empty");
            }

            // Simulate compression logic
            int compressedLength = (int)(data.Length * (compressionRatio ?? 0.5));
            string compressedData = data.Substring(0, compressedLength);

            return compressedData;
        }
        catch (Exception ex)
        {
            throw ex; // Re-throw the exception for handling at a higher level
        }
    }
}