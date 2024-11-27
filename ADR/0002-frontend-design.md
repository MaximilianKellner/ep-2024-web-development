# Frontend Design

|          |                                                            |
| -------- | ---------------------------------------------------------- |
| status   | in Progress                                                |
| date     | 27-11-2024                                                 |
| deciders | [Maximilian Kellner](https://github.com/MaximilianKellner) |

## Context and Problem Statement

We need a frontend-langage which is able to produce a modern, responsive and provides good performance.

## Decision Drivers

- Does it provide reusable components?
- How performant is it?
- Does it provide accessibility options?

## Considered Options

- HTML+CSS
- React

## Decision Outcome

Chosen option: "HTML+CSS", it is possible to wirte a lightwheigt forntend which is responsive and compatible with a wide range of browsers, there are many resources available, and it is the industry standard.

## Pros and Cons of the Options

### HTML+CSS

HTML is the foundational markup language used to structure content on the web, while CSS is used to style and layout that content, enabling the creation of visually appealing and responsive web pages.

- Good, HTML+CSS is compatible with a wide range of browsers.
- Good, HTML provides a readable structure even if the design doesnt load.
- Neutral, the code could be optimized with a development pipeline.
- Bad, HTML doesnt provide reusable Components

### React

React is a JavaScript library for building user interfaces, allowing developers to create reusable UI components and manage the state of dynamic web applications efficiently.

- Good, React allows the creation of reusable components, promoting code modularity and maintainability.
- Good, React has a large and active community, providing extensive libraries, tools, and documentation.
- Neutral, React requires a build process (e.g., with Webpack or Vite), adding complexity to the development setup.
- Bad, React's learning curve can be steep.