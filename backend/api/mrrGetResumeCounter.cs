using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace Company.Function
{
    // Azure Function class for getting and incrementing the resume counter
    public static class MrrGetResumeCounter
    {
        // Constants for Cosmos DB configuration
        private const string DatabaseName = "azureresume";
        private const string CollectionName = "counter";
        private const string DocumentId = "1";
        private const string PartitionKey = "1";

        // The main function that gets triggered by an HTTP request
        [FunctionName("MrrGetResumeCounter")]
        public static async Task<IActionResult> RunAsync(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", "post", Route = null)] HttpRequest req,
            // Input binding for the counter document from Cosmos DB
            [CosmosDB(DatabaseName, CollectionName, ConnectionStringSetting = "AzureResumeConnectionString", Id = DocumentId, PartitionKey = PartitionKey)] Counter counter,
            // Output binding for updating the counter document in Cosmos DB
            [CosmosDB(DatabaseName, CollectionName, ConnectionStringSetting = "AzureResumeConnectionString", Id = DocumentId, PartitionKey = PartitionKey)] IAsyncCollector<Counter> updatedCounterCollector,
            ILogger log) // Logger instance for logging messages
        {
            log.LogInformation("C# HTTP trigger function processed a request.");

            // Initialize the counter document if it does not exist yet.
            if (counter == null)
            {
                counter = new Counter
                {
                    id = DocumentId,
                    Count = 0
                };
            }

            // Increment the counter
            counter.Count++;

            // Update the counter in Cosmos DB
            await updatedCounterCollector.AddAsync(counter);

            // Return the updated counter as an OK response
            return new OkObjectResult(counter);
        }
    }

    // Class representing the counter document in Cosmos DB
    public class Counter
    {
        // ID property for the document, required by Cosmos DB
        public string id { get; set; }
        // Count property representing the current visit count
        public int Count { get; set; }
    }
    //Here is the end of the code
}
