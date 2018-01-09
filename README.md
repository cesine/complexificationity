## References

There are many tools to improve/understand code smells and maintainability. Most javasript projects use jshint/jslint/eslint to help automate code conventions. Others use plugins for continuous integration like CodeClimate, Sonar, Codebeat. These tools use similar measures (number of lines of code, similar code blocks and code complexity scores) to help encourage maintainability.


http://dandemeyere.com/blog/code-climate

> We believe in the saying you can't improve what you don't measure so at first, we used Code Climate to provide a starting point for our TD battle.



https://www.netguru.co/blog/comparison-automated-code-review-tools-codebeat-codacy-codeclimate-scrutinizer

> Code review makes your code stronger, reduces the risk of overlooking major bugs and supports the culture of feedback. ... automated code review tools


> used to test  the correctness of our code with CodeClimate. However, with increasing needs and expectations we decided to seek a better alternative that would have more advanced features. Our R&D team conducted an in-depth research and that’s how we found CodeBeat


https://hub.codebeat.co/docs/how-does-it-work


## Functions which are not functions

* Default code complexity for Code Climate is 5. There doesn't appear to be a metric https://docs.codeclimate.com/v1.0/docs/advanced-configuration which identifies functions which are only used once. The number of arguments metric could help balance function, but not if the arguments are an object.


* Codebeat is able to give a high rating to a file with highcomplexity if it is javascript.
