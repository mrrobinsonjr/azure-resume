using Microsoft.Extensions.Logging;
using Xunit;
using Moq;

namespace tests
{
    public class TestCounter
    {
        private readonly Mock<ILogger> loggerMock = new Mock<ILogger>();

        [Fact]
        public async Task Http_trigger_should_return_known_string()
        {
            var counter = new Company.Function.Counter
            {
                Id = "1",
                Count = 2
            };

            var request = TestFactory.CreateHttpRequest();

            var result = await Company.Function.GetResumeCounter.RunAsync(request, counter, Mock.Of<IAsyncCollector<Company.Function.Counter>>(), loggerMock.Object);

            var okResult = Assert.IsType<OkObjectResult>(result);
            var counterResult = Assert.IsType<Company.Function.Counter>(okResult.Value);
            Assert.Equal(3, counterResult.Count);
        }
    }
}
