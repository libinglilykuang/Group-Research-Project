// Compression Tests
// Write tests here using C# and the test plan

using System;
using System.Timers;
using NUnit.Framework;


namespace algorithmTests {
    [Test Class]

    public class algorithmTests {
        Console.WriteLine("\nCompression Algorithm Tests: \n");

        public algorithmTests(this, data, compressionRatio) {
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
    public void test_functionality(this) {
        // Check if the algorithm compresses data correctly
        List<int> data = new List<int>{1,2,3,4,5};
        double compressionRatio = 0.5
        try {
            List<int>compressed = this.algorithmTests(this, data, compressionRatio);
            Assert.Equal(compressed, {1,2}) // expect half the input size
            Console.WriteLine("\nFunctionality: OK");
        } catch (Exception e) {
            Assert.Fail("Functionality test failed" + e);
        }
    }

    // Test 2.1.2 - Accuracy
    public void test_accuracy(this) {
        // Check if the algorithm compresses data correctly
        List<int> data = new List<int>{10, 20, 30, 40, 50};
        double compressionRatio = 0.5;
        try {
            List<int>compressed = this.algorithmTests(this, data, compressionRatio);
            Assert.True(compressed.length > 0) // check length of compressed data list
            Console.WriteLine("\nAccuracy: OK");
        } catch (Exception e) {
            Assert.Fail("Accuracy test failed" + e);
        }
    }

    // Test 2.1.3 - Error Handling Empty
    public void test_emptyErrorNull(this) {
        List<int> data = new List<int>{};
        double compressionRatio = 0.5;
        try {
            List<int>compressed = this.algorithmTests(this, data, compressionRatio);
            Assert.Fail();
            Console.WriteLine("\Error handling null: OK");
        } catch (Exception e) {
            Assert.Fail("Error handling null failed" + e);
        }
    }

    // Test 2.1.4 - Error Handling None
    public void test_emptyErrorNone(this) {
        List<int> data = null;
        double compressionRatio = 0.5;
        try {
            List<int>compressed = this.algorithmTests(this, data, compressionRatio);
            Assert.Fail();
            Console.WriteLine("\n Error handling none: OK");
        } catch (Exception e) {
            Assert.Fail("Error handling none failed" + e);
        }
    }

    // Test 2.1.5 - Configurability
    public void test_configurability(this) {
        List<int>data = new List<int> {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
        double compressionRatio = 0.5;
        int expectedLength = 3;
        try {
            List<int>compressed = this.algorithmTests(this, data, compressionRatio);
            Assert.Equal(compressed.length, expectedLength);
            Console.WriteLine("\n Configurability: OK");
        } catch (Exception e) {
            Assert.Fail("Configurability test failed" + e);
        }
    }

    // Test 2.1.6 - Scalability
    public void test_scalability(this) {
        List<int>largeData = new List<int>[100_000_000]
        for (int i = 0; i < largeData.length; i++) {
            largeData[i] = (int) (Math.random() * 100_000_000);
        }
        int expectedLength = 10_000_000;
        double compressionRatio = 0.1;
        try {
            List<int>compressed = this.algorithmTests(this, data, compressionRatio);
            Assert.Equal(compressed.length, expectedLength);
            Console.WriteLine("\n Scalability: OK");
        } catch (Exception e) {
            Assert.Fail("Scalability test failed" + e);
        }
    }

    // Test 2.1.7 - Performance
    public void test_performance(this) {
        List<int>largeData = new List<int>[1_000_000]
        for (int i = 0; i < largeData.length; i++) {
            largeData[i] = (int) (Math.random() * 1_000_000);
        }
        Timer timer = new Timer();
        double compressionRatio = 0.1;
        try {
            double startTime = timer.start();
            List<int>compressed = this.algorithmTests(this, data, compressionRatio);
            double finishTime = timer.stop();
            
            Assert.True((finishTime-startTime) < 5);
            Console.WriteLine("\n Performance: OK");
        } catch (Exception e) {
            Assert.Fail("Performance test failed" + e);
        }
    }

    // Test 2.1.8 - Output Metrics
    public void test_outputMetrics(this) {
        List<int>data = new List<int> {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
        double compressionRatio = 0.4;
        try {
            List<int>compressed = this.algorithmTests(this, data, compressionRatio);
            int storageSavings = ((data.length - compressed.length) / data.length);
            Assert.That(storageSavings, Is.EqualTo(0.6).Within(1));
            Console.WriteLine("\n Output Metrics: OK");
        } catch (Exception e) {
            Assert.Fail("Output Metrics Test failed" + e);
        }
    }

    // Test 2.1.9 Edge Cases
    public void test_singlePoint(this) {
        // Test edge case with a single data point
        List<int>data = new List<int> {42};
        try {
            List<int>compressed = self.compression_algorithm(data, 0.5)
            Assert.Equal(compressed, [])  // expect single point removed
            Console.WriteLine("\nSingle Point Handling: OK")
        } catch (Exception e) {
            Assert.Fail("Single point edge case failed" + e);
        }
    }
    def test_highFrequency(this){
        // Test edge case with high frequency noise
        List<int>data = new List<int> {1, 100, 2, 200, 3, 300};
        double compressionRatio = 0.5;
        try {
            List<int>compressed = self.compression_algorithm(data, compressionRatio)
            Assert.Equal(compressed.length < data.length())  // expect noise reduced
            Console.WriteLine("\nHigh Frequency Handling: OK\n")
        } catch (Exception e) {
            Assert.Fail(f"High frequency edge case failed" + e)
        }
    }
    
        
    public class CompressionAlgorithm{
        public List<int> Compress(List<int> data, double ratio){
            int[] compressedData = data[data.length * compressionRatio];
            return data.Take(compressedData).ToList();
        }
    }

}




