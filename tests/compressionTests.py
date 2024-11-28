## Compression Tests
## Write tests here using python and the test plan

import unittest
import time

class CompressionTests(unittest.TestCase):
    # compression algorithm placeholder
    def compression_algorithm(self, data, compressionRatio=None):
        # simulate logic
        if data is None:
            raise ValueError("Input data cannot be None")
        if not data:
            raise ValueError("Input data cannot be empty")
        # simulated operation
        compressedData = data[:int(len(data) * (compressionRatio or 0.5))]
        return compressedData

    # Test 2.1.1 - Functionality
    def test_functionality(self):
        """Check if the algorithm compresses data correcly"""
        data = [1, 2, 3, 4, 5]
        compressed = self.compression_algorithm(data, 0.5)
        self.assertEqual(compressed, [1, 2]) # expect half the input size

    # Test 2.1.2 - Accuracy
    def test_accuracy(self):
        """Check if key data points are retained"""
        data = [10, 20, 30, 40, 50]
        compressed = self.compression_algorithm(data, 0.6)
        self.assertIn(30, compressed) # expect key data points are retained
        self.assertGreater(len(compressed), 0)

    # Test 2.1.3 - Error Handling
    def test_emptyError(self):
        """Check handling of empty input"""
        data = []
        with self.assertRaises(ValueError):  # expect some kind of error for empty input
            self.compression_algorithm(data)
    def test_noneError(self):
        """Check handling of None input"""
        data = None
        with self.assertRaises(ValueError):  # expect some kind of error for None input
            self.compression_algorithm(data)

    # Test 2.1.4 - Configurability
    def test_configurability(self):
        """Check user-defined parameters are valid"""
        data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        compressed = self.compression_algorithm(data, 0.3)
        self.assertEqual(len(compressed), 3) ## expect compression parameter applied
            
    # Test 2.1.5 - Scalability
    def test_large_dataset_creation(self):
        """Check for memory issues with large dataset"""
        largeData = [0] * 100_000_000
        compressed = self.compression_algorithm(largeData, 0.1)
        self.assertEqual(len(compressed), 10_000_000)
    
  
    ## Test 2.1.6 Performance
    def test_timeT():
        """Check compression algorithm returns within 5 seconds"""
        starttime = time.time()
        #  run compression algorithm for 1,000,000 points
        totaltime = round((time.time()) - starttime)
        print("Total time: " + str(totaltime))
        assert (totaltime < 5)

if __name__ == '__main__':
    unittest.main()
