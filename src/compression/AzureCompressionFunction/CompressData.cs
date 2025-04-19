using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using IntelligentPlant.Compression.DataFilters;
using IntelligentPlant.Compression.Models;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace AzureCompressionFunction
{
    public class CompressData
    {
        [Function("CompressData")]
        public async Task<HttpResponseData> Run(
            [HttpTrigger(AuthorizationLevel.Function, "post")] HttpRequestData req,
            FunctionContext executionContext)
        {
            var logger = executionContext.GetLogger("CompressData");
            logger.LogInformation("Processing compression request.");

            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            var request = JsonConvert.DeserializeObject<CompressionRequest>(requestBody);

            if (request?.RawData == null || request.Parameters == null)
            {
                var badResponse = req.CreateResponse(System.Net.HttpStatusCode.BadRequest);
                await badResponse.WriteStringAsync("Invalid request data. Expected 'rawData' and 'parameters'.");
                return badResponse;
            }

            var settings = new CompressionFilterSettings
            {
                DeviationLimit = request.Parameters.DeviationLimit,
                DeviationType = request.Parameters.DeviationType,
                MinimumResampleLimit = TimeSpan.Zero,
                MaximumResampleLimit = TimeSpan.Zero
            };

            var compressedSamples = new List<DataCoreTagValue>();
            var pipeline = new PipelineBuilder()
                .WithCompressionFilter(settings)
                .WithDestination(async (sample, ct) =>
                {
                    compressedSamples.Add(sample);
                    await Task.CompletedTask;
                })
                .Build();

            foreach (var dataPoint in request.RawData)
            {
                var sample = new DataCoreTagValue("Tag", dataPoint.Timestamp, dataPoint.Value);
                await pipeline.WriteAsync(sample);
            }

            var responseData = compressedSamples.Select(s => new
            {
                timestamp = s.UtcSampleTime.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
                value = s.NumericValue
            }).ToList();

            var response = req.CreateResponse(System.Net.HttpStatusCode.OK);
            response.Headers.Add("Content-Type", "application/json");
            await response.WriteStringAsync(JsonConvert.SerializeObject(responseData));
            return response;
        }
    }

    public class CompressionRequest
    {
        public List<DataPoint> RawData { get; set; }
        public CompressionParameters Parameters { get; set; }
    }

    public class DataPoint
    {
        public DateTime Timestamp { get; set; }
        public double Value { get; set; }
    }

    public class CompressionParameters
    {
        public double DeviationLimit { get; set; }
        public DeviationType DeviationType { get; set; }
    }
}
