## Compression Tests
## Write tests here using python and the test plan

### Lucas : tests 1-5
### Kasia : tests 6-9

import unittest
import time

class CompressionTests(unittest.TestCase):
    # Test 2.1.3 - Error Handling
    def test_empty_input(self):
        """Test handling of empty input"""
        data = []
        with self.assertRaises(Exception):  # expect some kind of error for empty input
            self.compression_algorithm(data)
    def test_none_input(self):
        """Test handling of None input"""
        data = None
        with self.assertRaises(Exception):  # expect some kind of error for None input
            self.compression_algorithm(data)
            
    # Test 2.1.5 - Scalability
    def test_large_dataset_creation(self):
        """Test for memory issues with large dataset"""
        try:
            large_data = [0] * 100_000_000
            self.assertIsNotNone(large_data)
            self.assertEqual(len(large_data), 100_000_000)
        except Exception as e:
            self.fail(f"Failed to create large dataset: {str(e)}")
    
    ## check compression algorithm runs without issues/errors?
    def test_check_compression():
        data = []
        # run compression algorithm
        assert()
    
    ## test for performance (time response)
    def test_timeT():
        starttime = time.time()
        #  run compression algorithm for 1,000,000 points
        totaltime = round((time.time()) - starttime)
        print("Total time: " + str(totaltime))
        assert (totaltime < 5)

if __name__ == '__main__':
    unittest.main()

## We realised that for many of the compression algorithm tests, 
## data is required from other parts of the system, 
## will likely feature more when we complete our integration/system testing later on.
## However, we have written several short unit tests...
## to ensure we are following test driven development and, 
## to make us think about the system as a whole as well as...
## the individual processes before we start programming.