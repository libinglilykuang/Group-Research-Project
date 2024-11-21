# Test Plan

## Front End

### Configuration Panel

|         ID           | Test Type      | Description  | Notes | Pass/Fail | Change Notes |
| -----------------    | -------------  | -----------  | ----- | --------- | ------------ |
| 1.1.1        |   Functionality     |  "optimise" button can be pressed  | When the user presses the "optimise" button, the app should calculate and apply the optimal compression values. | Written - 14/11/24 | n/a |
| 1.1.2        |               |             |              |              |              |
| 1.1.3        |               |             |              |              |              |
| 1.1.4        |               |             |              |              |              |

### Compression History Panel

|         ID           | Test Type      | Description  | Notes | Pass/Fail | Change Notes |
| -----------------    | -------------  | -----------  | ----- | --------- | ------------ |
| 1.2.1        |   Functionality     | Button to view History sidebar can be pressed  | When the user presses the button to view the Compression History sidebar, the app should maximise the panel to display previous compression configurations. | Written - 14/11/24 | n/a |
| 1.2.2        |               |             |              |              |              |
| 1.2.3        |               |             |              |              |              |
| 1.2.4        |               |             |              |              |              |

### Compression Visualisation Graphs

|         ID           | Test Type      | Description  | Notes | Pass/Fail | Change Notes |
| -----------------    | -------------  | -----------  | ----- | --------- | ------------ |
| 1.3.1        |   Functionality     |  Graph renders on page  | When the user sends data to be compressed, the app should display the resulting compression graph | Written - 14/11/24 | n/a |
| 1.3.2        |               |             |              |              |              |
| 1.3.3        |               |             |              |              |              |
| 1.3.4        |               |             |              |              |              |

## Back End

### Compression Algorithm


|         ID           | Test Type      | Description  | Notes | Pass/Fail | Change Notes |
| -----------------    | -------------  | -----------  | ----- | --------- | ------------ |
| 2.1.1        |   Functionality        |  Verify the algorithm compresses data correctly | When data is passed into the compression algorithm, it successfully compresses it and outputs the compressed data. | Written - 14/11/24 | n/a |
| 2.1.2        |     Accuracy           |   Check that the compression retains critical data within acceptable limits.          |  Ensure key points are preserved while reducing less critical data.      | Written 16/11/24        |       n/a       |
| 2.1.3        |     Error Handling     |  Verify the algorithm handles invalid or malformed data properly.        |  The algorithm should return clear error messags or warnings for invalid input.      | Written 16/11/24     |  n/a     |
| 2.1.4        |     Configurability    | Ensure the algorithm correctly applies user-defined parameters.    | User-provided settings, like compression ratio, must affect the output as expected.     | Written 16/11/24     |    n/a      |
| 2.1.5        |     Scalability    |  Test te algorithm's ability to handle large datasets.     | The algorithm should compress up to 100,000,000 points without crashing or failing.     | Written 16/11/24      | n/a    |
| 2.1.6        |     Performance   | Ensure compression completes within a reasonable time.    | Compression time should not exceed 5 seconds for 1,000,000 points.    | Written 16/11/24     |     n/a         |
| 2.1.7        |     Integration   | Check that the algorithm integrates well with other components.      | Compressed data should work correctly with the Data Core API and visualisation tools.   | Written 16/11/24    | n/a      |
| 2.1.8        |     Output Metrics     |  Confirm the algorithm calculates and displays metrics correctly.     | Metrics like storage savings, point counts and data fideltity must align with the actual results.      | Written 16/11/24    | n/a      |
| 2.1.9        |     Edge Cases         |  Test the algorithm with unusual or extreme datasets.      | Include datasets with single points, duplicates or high frequency noise.  | Written 16/11/24  | n/a    |


### Infrastructure

|         ID           | Test Type      | Description  | Notes | Pass/Fail | Change Notes |
| -----------------    | -------------  | -----------  | ----- | --------- | ------------ |
| 2.2.1        |   Functionality     |  Compression configuration can be stored  | When the user chooses to save configuration parameters, this is written into storage. | Written - 14/11/24 | n/a |
| 2.2.2        |               |             |              |              |              |
| 2.2.3        |               |             |              |              |              |
| 2.2.4        |               |             |              |              |              |