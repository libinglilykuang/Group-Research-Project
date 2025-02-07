// Compression Tests
// Write tests here using C# and the test plan

using System;
using System.Diagnostics;
using System.Timers;
using NUnit.Framework;


namespace algorithmTests {

    [TestFixture]
    public class algorithmTests {

        public int algorithmTests(List<int> data, double compressionRatio) {
            TestContext.WriteLine("\nCompression Algorithm Tests: \n");

            try {

                // check if data or compression ratio are null or empty
                if (data == null) {
                    throw new ArgumentNullException(nameof(data), "Input data cannot be null");
                } else if (data.Count == 0) {
                    throw new ArgumentException ("Data cannot be empty", (nameof(data)));
                }
                if (compressionRatio <= 0 || compressionRatio >= 1) {
                    compressionRatio = 0.5;
                }
                int compressedData = data[data.Count * (int)compressionRatio];
                return compressedData;
            } catch (Exception e){
                Console.WriteLine(e);
            }
        }

    // Test 2.1.1 - Functionality
    public void test_functionality() {
        // Check if the algorithm compresses data correctly
        List<int> data = new List<int>{1,2,3,4,5};
        double compressionRatio = 0.5;
        try {
            List<int>compressed = algorithmTests(data, compressionRatio);
            Assert.That(compressed, Is.EqualTo(new List<int>{1,2})); // expect half the input size
            Console.WriteLine("\nFunctionality: OK");
        } catch (Exception e) {
            Assert.Fail("Functionality test failed" + e);
        }
    }

    // Test 2.1.2 - Accuracy
    public void test_accuracy() {
        // Check if the algorithm compresses data correctly
        List<int> data = new List<int>{10, 20, 30, 40, 50};
        double compressionRatio = 0.5;
        try {
            List<int>compressed = algorithmTests(data, compressionRatio);
            Assert.True(compressed.Count > 0); // check length of compressed data list
            Console.WriteLine("\nAccuracy: OK");
        } catch (Exception e) {
            Assert.Fail("Accuracy test failed" + e);
        }
    }

    // Test 2.1.3 - Error Handling Empty
    public void test_emptyErrorNull() {
        List<int> data = new List<int>{};
        double compressionRatio = 0.5;
        try {
            List<int>compressed = algorithmTests(data, compressionRatio);
            Assert.Fail();
            Console.WriteLine("\nError handling null: OK");
        } catch (Exception e) {
            Assert.Fail("Error handling null failed" + e);
        }
    }

    // Test 2.1.4 - Error Handling None
    public void test_emptyErrorNone() {
        List<int> data = null;
        double compressionRatio = 0.5;
        try {
            List<int>compressed = algorithmTests(data, compressionRatio);
            Assert.Fail();
            Console.WriteLine("\n Error handling none: OK");
        } catch (Exception e) {
            Assert.Fail("Error handling none failed" + e);
        }
    }

    // Test 2.1.5 - Configurability
    public void test_configurability() {
        List<int>data = new List<int> {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
        double compressionRatio = 0.5;
        int expectedLength = 3;
        try {
            List<int>compressed = algorithmTests(data, compressionRatio);
            Assert.That(compressed.Count, Is.EqualTo(expectedLength));
            Console.WriteLine("\n Configurability: OK");
        } catch (Exception e) {
            Assert.Fail("Configurability test failed" + e);
        }
    }

    // Test 2.1.6 - Scalability
    public void test_scalability() {
        List<int>largeData = new List<int>(100_000_000);
        for (int i = 0; i < largeData.Count; i++) {
            largeData[i] = new Random().Next(100_000_00);
        }
        int expectedLength = 10_000_000;
        double compressionRatio = 0.1;
        try {
            List<int>compressed = algorithmTests(largeData, compressionRatio);
            Assert.That(compressed.Count, Is.EqualTo(expectedLength));
            Console.WriteLine("\n Scalability: OK");
        } catch (Exception e) {
            Assert.Fail("Scalability test failed" + e);
        }
    }

    // Test 2.1.7 - Performance
    public void test_performance() {
        List<int>largeData = new List<int>(1_000_000);
        for (int i = 0; i < largeData.Count; i++) {
            largeData[i] = new Random().Next(1_000_000);
        }
        double compressionRatio = 0.1;
        try {
            Stopwatch timer = Stopwatch.StartNew();
            List<int>compressed = algorithmTests(largeData, compressionRatio);
            timer.Stop();
            double totalTime = timer.Elapsed.TotalSeconds;
            
            Assert.True(totalTime < 5);
            Console.WriteLine("\n Performance: OK");
        } catch (Exception e) {
            Assert.Fail("Performance test failed" + e);
        }
    }

    // Test 2.1.8 - Output Metrics
    public void test_outputMetrics() {
        List<int>data = new List<int> {1, 2, 3, 4, 5, 6, 7, 8, 9, 10};
        double compressionRatio = 0.4;
        try {
            List<int>compressed = algorithmTests(data, compressionRatio);
            int storageSavings = (data.Count - compressed.Count) / data.Count;
            Assert.That(storageSavings, Is.EqualTo(0.6).Within(1));
            Console.WriteLine("\n Output Metrics: OK");
        } catch (Exception e) {
            Assert.Fail("Output Metrics Test failed" + e);
        }
    }

    // Test 2.1.9 Edge Cases
    public void test_singlePoint() {
        // Test edge case with a single data point
        List<int>data = new List<int> {42};
        try {
            List<int>compressed = algorithmTests(data, 0.5);
            Assert.That(compressed, Is.EqualTo(new List<int>{}));  // expect single point removed
            Console.WriteLine("\nSingle Point Handling: OK");
        } catch (Exception e) {
            Assert.Fail("Single point edge case failed" + e);
        }
        
    }

    public void test_highFrequency(){
        // Test edge case with high frequency noise
        List<int>data = new List<int> {1, 100, 2, 200, 3, 300};
        double compressionRatio = 0.5;
        try {
            List<int>compressed = algorithmTests(data, compressionRatio);
            Assert.That(compressed.Count < data.Count());  // expect noise reduced
            Console.WriteLine("\nHigh Frequency Handling: OK\n");
        } catch (Exception e) {
            Assert.Fail("\nHigh frequency edge case failed" + e);
        }
    }
    
        
    public class CompressionAlgorithm{
        public List<int> Compress(List<int> data, double ratio){
            int compressedData = data[data.Count * (int)ratio];
            return data.Take(compressedData).ToList();
        }
    }

    }

}




