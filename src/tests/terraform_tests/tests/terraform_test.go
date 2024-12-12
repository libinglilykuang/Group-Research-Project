package test

import (
	"testing"

	"github.com/gruntwork-io/terratest/modules/terraform"
	"github.com/stretchr/testify/assert"
)

// ensures a clean state before each test
func setup(t *testing.T) *terraform.Options {
	terraformOptions := &terraform.Options{
		TerraformDir: "../terraform",
	}

	defer terraform.Destroy(t, terraformOptions)
	terraform.InitAndApply(t, terraformOptions)

	return terraformOptions
}

func Test_2_2_2_InputBlobContainerExists(t *testing.T) {
	terraformOptions := setup(t)

	// Check the input blob container exists
	inputBlobContainer := terraform.Output(t, terraformOptions, "IP_input_blob_container")
	// Check the name is correct
	assert.Equal(t, "IP-input-container", inputBlobContainer, "Input blob container should exist and name should match expected.")
}

func Test_2_2_3_OutputBlobContainerExists(t *testing.T) {
	terraformOptions := setup(t)

	// Check the output blob container exists
	outputBlobContainer := terraform.Output(t, terraformOptions, "IP_output_blob_container")
	// Check the name is correct
	assert.Equal(t, "IP-output-container", outputBlobContainer, "Output blob container should exist and name should match expected.")
}

func Test_2_2_4_ServiceBusQueueExists(t *testing.T) {
	terraformOptions := setup(t)

	// Check the service bus queue exists
	serviceBusQueue := terraform.Output(t, terraformOptions, "IP_service_bus_queue")
	// Check the name is correct
	assert.Equal(t, "IP-fifo-queue", serviceBusQueue, "Service Bus Queue should exist and name should match expected.")
}

func Test_2_2_5_CompressionFunctionExists(t *testing.T) {
	terraformOptions := setup(t)

	// Check the compression function exists
	compressionFunction := terraform.Output(t, terraformOptions, "IP_compression_function")
	// Check the name is correct
	assert.Equal(t, "IP-compression-function", compressionFunction, "Compression Azure Function should exist and name should match expected.")
}

func Test_2_2_6_APIDataCollectionFunctionExists(t *testing.T) {
	terraformOptions := setup(t)

	// Check the API data collection function exists
	apiDataCollectionFunction := terraform.Output(t, terraformOptions, "IP_api_data_collection_function")
	// Check the name is correct
	assert.Equal(t, "IP-API-data-getter-function", apiDataCollectionFunction, "API Data Collection Azure Function should exist and name should match expected.")
}

func Test_2_2_7_EventGridSubscriptionExists(t *testing.T) {
	terraformOptions := setup(t)

	// Check the Event Grid subscription exists
	eventGridSubscription := terraform.Output(t, terraformOptions, "IP_event_grid_subscription")
	// Check the name is correct
	assert.Equal(t, "IP-blob-created", eventGridSubscription, "Event Grid subscription should exist and name should match expected.")
}
