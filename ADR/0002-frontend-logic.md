# Frontend Logic

|          |                                                            |
| -------- | ---------------------------------------------------------- |
| status   | in Progress                                                |
| date     | 26-11-2024                                                 |
| deciders | [Maximilian Kellner](https://github.com/MaximilianKellner) |

## Context and Problem Statement

In order to write a frontend which is able to handle data Inputs, uploads and server requests some logic is required.

## Decision Drivers

- How easy is it to integrate?
- How hard is it to learn?
- How performant is it?
- Is it possible to handle files?

## Considered Options

- JavaScript
- TypeScript

## Decision Outcome

Chosen option: "JavaScript", because we are already familiar with it, there are many resources available, and it is the industry standard.

## Pros and Cons of the Options

### JavaScript

JavaScript is a versatile, high-level programming language primarily used for dynamic and interactive web applications, both on the client and server side.

- Good, JavaScript is widely supported by all modern browsers.
- Good, JavaScript basics are easy to learn, and we have already acquired a solid foundation in it.
- Good, JavaScript can be used across the full stack.
- Bad, JavaScript's dynamic typing can lead to unexpected runtime errors and make debugging more difficult in complex applications.
- Bad, JavaScript's single-threaded nature can lead to performance bottlenecks for CPU-intensive tasks.
- Bad, Security vulnerabilities, such as cross-site scripting (XSS), are common issues when JavaScript is not implemented securely.

### TypeScript

TypeScript is a statically-typed superset of JavaScript that compiles to plain JavaScript, offering enhanced tooling and type safety for large-scale applications.

- Good, TypeScript's static typing helps catch errors at compile time, reducing the likelihood of runtime errors.
- Good, TypeScript improves code maintainability and readability, especially in large codebases, by providing clear types and interfaces.
- Neutral, TypeScript requires a compilation step, which adds complexity to the build process and can slow down development but may improve runtime performance.
- Bad, Developers need to learn and adopt type annotations and TypeScript-specific features, which can have a steeper learning curve compared to JavaScript.
- Bad, TypeScript's type system can sometimes be overkill for smaller projects or simple scripts, leading to unnecessary complexity.
