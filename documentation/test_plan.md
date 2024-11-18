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
| 2.1.2        |     Accuracy           |   Check that the compression retains critical data within acceptable limits.          |    Written 16/11/24          |  n/a            |              |
| 2.1.3        |     Error Handling     |             |              |              |              |
| 2.1.4        |     Configurability    |             |              |              |              |
| 2.1.5        |     Scalability        |             |              |              |              |
| 2.1.6        |     Performance        |             |              |              |              |
| 2.1.7        |     Integration        |             |              |              |              |
| 2.1.8        |     Output Metrics     |             |              |              |              |
| 2.1.9        |     Edge Cases         |             |              |              |              |



### Infrastructure

|         ID           | Test Type      | Description  | Notes | Pass/Fail | Change Notes |
| -----------------    | -------------  | -----------  | ----- | --------- | ------------ |
| 2.2.1        |   Functionality     |  Compression configuration can be stored  | When the user chooses to save configuration parameters, this is written into storage. | Written - 14/11/24 | n/a |
| 2.2.2        |               |             |              |              |              |
| 2.2.3        |               |             |              |              |              |
| 2.2.4        |               |             |              |              |              |