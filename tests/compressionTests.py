## Compression Tests
## Write tests here using python and the test plan

import unittest
import time

print("\nCompression Algorithm Test: \n")

class CompressionTests(unittest.TestCase):
    # compression algorithm placeholder
    def compression_algorithm(self, data, compressionRatio=None):
        try:
            # simulate logic
            if data is None:
                raise ValueError("Input data cannot be None")
            if not data:
                raise ValueError("Input data cannot be empty")
            # simulate operation
            compressedData = data[:int(len(data) * (compressionRatio or 0.5))]
            return compressedData
        except Exception as e:
            raise e

    # Test 2.1.1 - Functionality
    def test_functionality(self):
        """Check if the algorithm compresses data correctly"""
        data = [1, 2, 3, 4, 5]
        try:
            compressed = self.compression_algorithm(data, 0.5)
            self.assertEqual(compressed, [1, 2]) # expect half the input size
            print("\nFunctionality: OK")
        except Exception as e:
            self.fail(f"Functionality test failed: {e}")

    # Test 2.1.2 - Accuracy
    def test_accuracy(self):
        """Check if key data points are retained"""
        data = [10, 20, 30, 40, 50]
        compressed = self.compression_algorithm(data, 0.6)
        self.assertIn(30, compressed) # expect key data points are retained
        self.assertGreater(len(compressed), 0)
    print("Accuracy: OK")

    # Test 2.1.3 - Error Handling
    def test_emptyError(self):
        """Check handling of empty input"""
        data = []
        try:
            with self.assertRaises(ValueError):  # expect some kind of error for empty input
                self.compression_algorithm(data)
            print("\nEmpty Input Handling: OK")
        except Exception as e:
            self.fail(f"Empty input error handling failed: {e}")
    def test_noneError(self):
        """Check handling of None input"""
        data = None
        try:
            with self.assertRaises(ValueError):  # expect some kind of error for None input
                self.compression_algorithm(data)
            print("\nNone Input Handling: OK")
        except Exception as e:
            self.fail(f"None input error handling failed: {e}")

    # Test 2.1.4 - Configurability
    def test_configurability(self):
        """Check user-defined parameters are valid"""
        data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        try:
            compressed = self.compression_algorithm(data, 0.3)
            self.assertEqual(len(compressed), 3)  # expect compression parameter applied
            print("\nConfigurability: OK")
        except Exception as e:
            self.fail(f"Configurability test failed: {e}")

    # Test 2.1.5 - Scalability
    def test_large_dataset_creation(self):
        """Check for memory issues with large dataset"""
        largeData = [0] * 100_000_000
        try:
            compressed = self.compression_algorithm(largeData, 0.1)
            self.assertEqual(len(compressed), 10_000_000)
            print("\nScalability: OK")
        except Exception as e:
            self.fail(f"Scalability test failed: {e}")

    # Test 2.1.6 Performance
    def test_performance(self):
        """Check if operation finishes within a reasonable time"""
        data = [0] * 1_000_000
        try:
            startTime = time.time()
            self.compression_algorithm(data, 0.5)
            endTime = time.time()
            self.assertLess(endTime - startTime, 5)
            print("\nPerformance: OK")
        except Exception as e:
            self.fail(f"Performance test failed: {e}")

    # Test 2.1.7 - Integration



    # Test 2.1.8 - Output Metrics
    def test_outputMetrics(self):
        """Check if output metrics are accurate"""
        data = [10, 20, 30, 40, 50]
        try:
            compressed = self.compression_algorithm(data, 0.4)
            storageSavings = (len(data) - len(compressed)) / len(data)
            self.assertAlmostEqual(storageSavings, 0.6, places=1)
            print("\nOutput Metrics: OK")
        except Exception as e:
            self.fail(f"Output metrics test failed: {e}")

    # Test 2.1.9 Edge Cases
    def test_singlePoint(self):
        """Test edge case with a single data point"""
        data = [42]
        try:
            compressed = self.compression_algorithm(data, 0.5)
            self.assertEqual(compressed, [])  # expect single point removed
            print("\nSingle Point Handling: OK")
        except Exception as e:
            self.fail(f"Single point edge case failed: {e}")
    def test_highFrequency(self):
        """Test edge case with high frequency noise"""
        data = [1, 100, 2, 200, 3, 300]
        try:
            compressed = self.compression_algorithm(data, 0.5)
            self.assertLess(len(compressed), len(data))  # expect noise reduced
            print("\nHigh Frequency Handling: OK\n")
        except Exception as e:
            self.fail(f"High frequency edge case failed: {e}")

if __name__ == '__main__':
    unittest.main()
