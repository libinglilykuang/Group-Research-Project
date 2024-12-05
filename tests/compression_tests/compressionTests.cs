// Compression Tests
// Write tests here using C# and the test plan

using System;

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

        // Test 2.1.1 - Functionality
        public void test_functionality(self) {
            // Check if the algorithm compresses data correctly
            int[] data = [1,2,3,4,5];
            try {
                compressed = self.compression_algorithm(data, 0.5);
                self.assertEqual(compressed, [1,2]) // expect half the input size
                Console.WriteLine("\nFunctionality: OK");
            } catch (Exception e) {
                self.fail("Functionality test failed" + e);
            }
        }
        
    }


}




