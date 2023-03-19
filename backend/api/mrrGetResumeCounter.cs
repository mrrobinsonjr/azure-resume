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
    public static class mrrGetResumeCounter
    {
        private const string DatabaseName = "azureresume";
        private const string CollectionName = "counter";
        private const string Id = "1";
        private const string PartitionKey = "1";

        [FunctionName("mrrGetResumeCounter")]
        public static async Task<IActionResult> RunAsync(
            [HttpTrigger(AuthorizationLevel.Function, "get", "post", Route = null)] HttpRequest req,
            [CosmosDB(DatabaseName, CollectionName, ConnectionStringSetting = "AzureResumeConnectionString", Id = Id, PartitionKey = PartitionKey)] counter counter,
            [CosmosDB(DatabaseName, CollectionName, ConnectionStringSetting = "AzureResumeConnectionString", Id = Id, PartitionKey = PartitionKey)] IAsyncCollector<counter> updatedCounterCollector,
            ILogger log)
        {
            log.LogInformation("C# HTTP trigger function processed a request.");

            counter.count++;

            await updatedCounterCollector.AddAsync(counter);

            return new OkObjectResult(counter);
        }
    }
    public class counter
    {
        public string id { get; set; }
        public int count { get; set; }
    }

}