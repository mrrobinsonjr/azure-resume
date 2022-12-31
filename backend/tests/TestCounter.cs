using Microsoft.Extensions.Logging;
using Xunit;

namespace tests
{
    public class TestCounter
    {
        private readonly ILogger logger = TestFactory.CreateLogger();

        [Fact]
        public async void Http_trigger_should_return_known_string()
        {
            var counter = new Company.Function.Counter();
            counter.Id = "1";
            counter.Count = 2;
            var request = TestFactory.CreateHttpRequest();
            var response = (HttpResponseMessage) Company.Function.azure-resume-challenge.Run(request, counter, out counter, logger);
            Assert.Equal(3, counter.Count);
        }

    }
}