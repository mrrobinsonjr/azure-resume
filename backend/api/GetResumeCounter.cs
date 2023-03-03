using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System.Net.Http;
using System.Text;

namespace Company.Function
{
    public static class GetResumeCounter
    {
        private const string DatabaseName = "AzureResume";
        private const string CollectionName = "Counter";
        private const string Id = "1";
        private const string PartitionKey = "1";

        [FunctionName("GetResumeCounter")]
        public static async Task<IActionResult> RunAsync(
            [HttpTrigger(AuthorizationLevel.Function, "get", "post", Route = null)] HttpRequest req,
            [CosmosDB(DatabaseName, CollectionName, ConnectionStringSetting = "AzureResumeConnectionString", Id = Id, PartitionKey = PartitionKey)] Counter counter,
            [CosmosDB(DatabaseName, CollectionName, ConnectionStringSetting = "AzureResumeConnectionString", Id = Id, PartitionKey = PartitionKey)] IAsyncCollector<Counter> updatedCounterCollector,
            ILogger log)
        {
            log.LogInformation("C# HTTP trigger function processed a request.");

            counter.Count++;

            await updatedCounterCollector.AddAsync(counter);

            return new OkObjectResult(counter);
        }
    }
}
