# Compression Tests

---

## **Test 2.1.1 - Functionality**  
**Purpose**: Verifies the algorithm reduces data size correctly based on the specified compression ratio.

### Code Breakdown:
```python
def test_functionality(self):
    """Check if the algorithm compresses data correctly"""
    data = [1, 2, 3, 4, 5]  # Step 1: Define the input data for the test.
```
- **Step 1**: Input data is initialized. `[1, 2, 3, 4, 5]` is the dataset to be compressed.

```python
    try:
        compressed = self.compression_algorithm(data, 0.5)  # Step 2: Call the algorithm with a 50% compression ratio.
```
- **Step 2**: The `compression_algorithm` is invoked with the dataset and a compression ratio of `0.5`. This simulates reducing the dataset size by half.

```python
        self.assertEqual(compressed, [1, 2])  # Step 3: Verify the compressed result matches the expected output.
```
- **Step 3**: Assert that the compressed result `[1, 2]` matches the expected outcome, confirming the algorithm works correctly for this case.

```python
        print("\nFunctionality: OK")  # Step 4: Print a success message.
```
- **Step 4**: If the test passes, a success message is printed.

```python
    except Exception as e:
        self.fail(f"Functionality test failed: {e}")  # Step 5: Handle exceptions and report failure.
```
- **Step 5**: If an exception occurs during the test, it is caught, and the test is marked as failed with an appropriate error message.

**© 2024-2025 GRP Team 6. All rights reserved.**

---

## **Test 2.1.2 - Accuracy**  
**Purpose**: Ensures key data points are retained and output is non-empty.

### Code Breakdown:
```python
def test_accuracy(self):
    """Check if key data points are retained"""
    data = [10, 20, 30, 40, 50]  # Step 1: Define the input data for accuracy testing.
```
- **Step 1**: Input data is initialized to ensure sufficient variance to test retention of key data points.

```python
    compressed = self.compression_algorithm(data, 0.6)  # Step 2: Compress the data with a 60% ratio.
```
- **Step 2**: The algorithm is called with a `0.6` ratio to retain a majority of the data while discarding some.

```python
    self.assertIn(30, compressed)  # Step 3: Verify that the key point `30` is present in the output.
```
- **Step 3**: Check that `30`, a significant data point in the input, is retained in the compressed dataset.

```python
    self.assertGreater(len(compressed), 0)  # Step 4: Ensure the output is not empty.
```
- **Step 4**: Validate that the compressed dataset contains elements, ensuring meaningful results.

```python
    print("Accuracy: OK")  # Step 5: Print a success message.
```
- **Step 5**: Confirm success of the accuracy test.

**© 2024-2025 GRP Team 6. All rights reserved.**

---

## **Test 2.1.3 - Error Handling**  
### **Empty Input Handling**

**Purpose**: Verifies that the algorithm raises an error when input is empty.

### Code Breakdown:
```python
def test_emptyError(self):
    """Check handling of empty input"""
    data = []  # Step 1: Define an empty list as input.
```
- **Step 1**: Initialize an empty list as the test input.

```python
    try:
        with self.assertRaises(ValueError):  # Step 2: Expect a ValueError for empty input.
            self.compression_algorithm(data)  # Step 3: Call the algorithm with empty data.
```
- **Step 2**: Wrap the function call in `assertRaises` to check if the error is raised.
- **Step 3**: Execute the function, which should trigger the exception due to the empty input.

```python
        print("\nEmpty Input Handling: OK")  # Step 4: Print a success message.
```
- **Step 4**: If the error is correctly raised, print a confirmation.

```python
    except Exception as e:
        self.fail(f"Empty input error handling failed: {e}")  # Step 5: Handle unexpected exceptions.
```
- **Step 5**: Catch any other exceptions and report failure if behavior deviates.

### **None Input Handling**

**Purpose**: Validates the algorithm's response to `None` as input.

### Code Breakdown:
```python
def test_noneError(self):
    """Check handling of None input"""
    data = None  # Step 1: Define None as input.
```
- **Step 1**: Initialize `None` as the test input.

```python
    try:
        with self.assertRaises(ValueError):  # Step 2: Expect a ValueError for None input.
            self.compression_algorithm(data)  # Step 3: Call the algorithm with None as input.
```
- **Step 2 & Step 3**: Follow the same error-handling verification process as the empty input test.

**© 2024-2025 GRP Team 6. All rights reserved.**

---

## **Test 2.1.4 - Configurability**  
**Purpose**: Confirms the algorithm respects user-defined compression ratios.

### Code Breakdown:
```python
def test_configurability(self):
    """Check user-defined parameters are valid"""
    data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]  # Step 1: Define input data for testing.
```
- **Step 1**: Input data is defined with sufficient elements to test configurability.

```python
    try:
        compressed = self.compression_algorithm(data, 0.3)  # Step 2: Compress data with a 30% ratio.
```
- **Step 2**: Call the algorithm with a compression ratio of `0.3`.

```python
        self.assertEqual(len(compressed), 3)  # Step 3: Verify the output length matches the compression ratio.
```
- **Step 3**: Assert the compressed output length equals `3` (30% of the input size).

```python
        print("\nConfigurability: OK")  # Step 4: Print a success message.
```
- **Step 4**: Confirm successful configurability testing.

**© 2024-2025 GRP Team 6. All rights reserved.**

---

## **Test 2.1.5 - Scalability**  
**Purpose**: Ensures the algorithm handles large datasets efficiently.

### Code Breakdown:
```python
def test_large_dataset_creation(self):
    """Check for memory issues with large dataset"""
    largeData = [0] * 100_000_000  # Step 1: Create a large dataset for testing.
```
- **Step 1**: Initialize a dataset with `100,000,000` elements.

```python
    try:
        compressed = self.compression_algorithm(largeData, 0.1)  # Step 2: Compress with a 10% ratio.
```
- **Step 2**: Apply compression to reduce the dataset to 10% of its size.

```python
        self.assertEqual(len(compressed), 10_000_000)  # Step 3: Validate the output size matches expectations.
```
- **Step 3**: Verify the compressed output size is exactly `10,000,000`.

```python
        print("\nScalability: OK")  # Step 4: Print a success message.
```
- **Step 4**: Confirm scalability test success.

**© 2024-2025 GRP Team 6. All rights reserved.**

---

## **Test 2.1.6 - Performance**  
**Purpose**: Checks whether the algorithm processes large datasets within a reasonable timeframe.

### Code Breakdown:
```python
def test_performance(self):
    """Check if operation finishes within a reasonable time"""
    data = [10] * 1_000_000  # Step 1: Create a dataset with 1,000,000 elements.
```
- **Step 1**: Define a dataset of size `1,000,000` to simulate a high workload.

```python
    try:
        startTime = time.time()  # Step 2: Record the start time.
        self.compression_algorithm(data, 0.5)  # Step 3: Execute the compression algorithm with a 50% ratio.
        endTime = time.time()  # Step 4: Record the end time.
```
- **Step 2**: Capture the starting timestamp before running the compression.
- **Step 3**: Run the compression algorithm with a `0.5` ratio.
- **Step 4**: Capture the ending timestamp after the compression finishes.

```python
        self.assertLess(endTime - startTime, 5)  # Step 5: Ensure the total execution time is less than 5 seconds.
```
- **Step 5**: Assert that the operation finishes within 5 seconds.

```python
        print("\nPerformance: OK")  # Step 6: Print a success message.
```
- **Step 6**: Confirm the test’s success if the time constraint is met.

```python
    except Exception as e:
        self.fail(f"Performance test failed: {e}")  # Step 7: Handle unexpected exceptions.
```
- **Step 7**: Catch any exceptions and mark the test as failed if unexpected behavior occurs.

**© 2024-2025 GRP Team 6. All rights reserved.**

---

## **Test 2.1.7 - Integration** 

**© 2024-2025 GRP Team 6. All rights reserved.**

---

## **Test 2.1.8 - Output Metrics**  
**Purpose**: Ensures storage savings are calculated correctly.

### Code Breakdown:
```python
def test_outputMetrics(self):
    """Check if output metrics are accurate"""
    data = [10, 20, 30, 40, 50]  # Step 1: Define the input dataset.
```
- **Step 1**: Initialize the dataset to verify savings calculations.

```python
    try:
        compressed = self.compression_algorithm(data, 0.4)  # Step 2: Compress the data with a 40% ratio.
        storageSavings = (len(data) - len(compressed)) / len(data)  # Step 3: Calculate storage savings.
```
- **Step 2**: Execute the algorithm with a `0.4` ratio.
- **Step 3**: Compute storage savings using the formula:  
```markdown
                                        Savings = (Original Size - Compressed Size) / Original Size
```

```python
        self.assertAlmostEqual(storageSavings, 0.6, places=1)  # Step 4: Verify that the savings are approximately 60%.
```
- **Step 4**: Assert that the calculated savings are close to 60%, allowing minor rounding differences.

```python
        print("\nOutput Metrics: OK")  # Step 5: Print a success message.
```
- **Step 5**: Confirm successful verification of output metrics.

```python
    except Exception as e:
        self.fail(f"Output metrics test failed: {e}")  # Step 6: Handle unexpected exceptions.
```
- **Step 6**: Report failure if an unexpected exception occurs.

**© 2024-2025 GRP Team 6. All rights reserved.**

---

## **Test 2.1.9 - Edge Cases**  
### **Single Data Point Handling**  
**Purpose**: Tests the algorithm's behavior when input contains only one element.

### Code Breakdown:
```python
def test_singlePoint(self):
    """Test edge case with a single data point"""
    data = [42]  # Step 1: Define the input dataset with one element.
```
- **Step 1**: Initialize a dataset with a single element to test minimal input behavior.

```python
    try:
        compressed = self.compression_algorithm(data, 0.5)  # Step 2: Compress with a 50% ratio.
```
- **Step 2**: Run the algorithm. Since the dataset has only one element, compression should yield an empty result.

```python
        self.assertEqual(compressed, [])  # Step 3: Verify that the output is an empty list.
```
- **Step 3**: Assert that the compressed output is empty.

```python
        print("\nSingle Point Handling: OK")  # Step 4: Print a success message.
```
- **Step 4**: Confirm the test’s success.

```python
    except Exception as e:
        self.fail(f"Single point edge case failed: {e}")  # Step 5: Handle unexpected exceptions.
```
- **Step 5**: Report failure for unexpected behavior.

### **High-Frequency Noise Handling**  
**Purpose**: Ensures the algorithm effectively reduces noise in a dataset with rapid fluctuations.

### Code Breakdown:
```python
def test_highFrequency(self):
    """Test edge case with high frequency noise"""
    data = [1, 100, 2, 200, 3, 300]  # Step 1: Define the input dataset with high frequency noise.
```
- **Step 1**: Initialize a dataset containing alternating low and high values to simulate high-frequency noise.

```python
    try:
        compressed = self.compression_algorithm(data, 0.5)  # Step 2: Compress the dataset with a 50% ratio.
```
- **Step 2**: Apply the algorithm to compress the dataset.

```python
        self.assertLess(len(compressed), len(data))  # Step 3: Ensure the output has fewer elements than the input.
```
- **Step 3**: Assert that the compressed dataset is smaller, indicating noise reduction.

```python
        print("\nHigh Frequency Handling: OK\n")  # Step 4: Print a success message.
```
- **Step 4**: Confirm successful handling of high-frequency noise.

```python
    except Exception as e:
        self.fail(f"High frequency edge case failed: {e}")  # Step 5: Handle unexpected exceptions.
```
- **Step 5**: Report failure if unexpected behavior occurs.

**© 2024-2025 GRP Team 6. All rights reserved.**

---