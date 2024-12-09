// Compression Tests
// Write tests here using C# and the test plan

using System;
using NUnit.Framework;


namespace compression_tests {
    [Test Class]
    public class compressionTests {
        Console.WriteLine("\nCompression Algorithm Tests: \n");

        public int compression_algorithm(self, data, compressionRatio) {
            try {
                // simulate logic
                if (data == null) {
                    throw new ArgumentNullException(nameof(data), "Input data cannot be null");
                } else if (data.isNullorEmpty()) {
                    throw new ArgumentException ("Data cannot be empty " (nameof(data)));
                }
                // simulate operation
                if (compressionRatio.isNullorEmpty()) {
                    compressionRatio = 0.5
                }
                int[] compressedData = data[data.length * compressionRatio];
                return compressedData;
            } catch (Exception e){
                Console.WriteLine(e);
            }
        }
    }

        // Test 2.1.1 - Functionality
        public void test_functionality() {
            // Check if the algorithm compresses data correctly
            List<int> data = new List<int>{1,2,3,4,5};
            double compressionRatio = 0.5
            try {
                List<int>compressed = compression_algorithm.Compress(data, compressionRatio);
                Assert.Equal(compressed, {1,2}) // expect half the input size
                Console.WriteLine("\nFunctionality: OK");
            } catch (Exception e) {
                Assert.Fail("Functionality test failed" + e);
            }
        }
        
    public class CompressionAlgorithm{
        public List<int> Compress(List<int> data, double ratio){
            int[] compressedData = data[data.length * compressionRatio];
            return data.Take(compressedData).ToList();
        }
    }

}




