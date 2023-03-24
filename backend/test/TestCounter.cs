using Company.Function;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Xunit;
using Microsoft.Azure.WebJobs;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using System.Net;
using System.Net.Http;
using System.Text;
using NSubstitute;

namespace tests
{
    public class TestCounter
    {
        private readonly ILogger logger = TestFactory.CreateLogger();

        [Fact]
        public async void Http_trigger_should_return_known_string()
        {
            var counter = new Counter();
            counter.id = "1";
            counter.Count = 2;
            var request = TestFactory.CreateHttpRequest();

            // Create a mock IAsyncCollector<Counter> object
            var mockCounterCollector = Substitute.For<IAsyncCollector<Counter>>();

            // Update the method call with the mock object
            var response = (OkObjectResult) (await MrrGetResumeCounter.RunAsync(request, counter, mockCounterCollector, logger));
            var updatedCounter = response.Value as Counter;
            Assert.Equal(3, updatedCounter.Count);
        }
    }
}
