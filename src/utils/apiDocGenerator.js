import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import * as t from '@babel/types';

class APIDocGenerator {
  constructor(options = {}) {
    this.options = {
      inputDir: './src/services',
      outputDir: './docs/api',
      format: 'markdown',
      includeExamples: true,
      ...options,
    };

    this.apiDocs = {};
  }

  async generate() {
    try {
      const files = this.getAPIFiles();
      
      for (const file of files) {
        const content = readFileSync(file, 'utf-8');
        const ast = parse(content, {
          sourceType: 'module',
          plugins: ['jsx', 'typescript'],
        });

        this.processAST(ast, file);
      }

      this.generateOutput();
    } catch (error) {
      console.error('API documentation generation failed:', error);
      throw error;
    }
  }

  processAST(ast, filename) {
    traverse(ast, {
      ClassDeclaration: (path) => {
        const className = path.node.id.name;
        this.apiDocs[className] = {
          name: className,
          description: this.getClassDescription(path),
          methods: {},
        };

        path.traverse({
          ClassMethod: (methodPath) => {
            const methodName = methodPath.node.key.name;
            const docs = this.processMethod(methodPath);
            this.apiDocs[className].methods[methodName] = docs;
          },
        });
      },

      FunctionDeclaration: (path) => {
        const functionName = path.node.id.name;
        this.apiDocs[functionName] = {
          name: functionName,
          ...this.processFunction(path),
        };
      },
    });
  }

  processMethod(path) {
    const comments = path.node.leadingComments || [];
    const docs = {
      name: path.node.key.name,
      description: '',
      params: [],
      returns: null,
      throws: [],
      examples: [],
    };

    for (const comment of comments) {
      if (comment.type === 'CommentBlock') {
        const lines = comment.value.split('\n');
        for (const line of lines) {
          this.parseDocLine(line.trim(), docs);
        }
      }
    }

    // Extract parameter types from TypeScript annotations
    if (path.node.params) {
      path.node.params.forEach((param, index) => {
        if (t.isIdentifier(param)) {
          const paramName = param.name;
          const typeAnnotation = param.typeAnnotation?.typeAnnotation;
          
          if (!docs.params[index]) {
            docs.params[index] = { name: paramName };
          }
          
          if (typeAnnotation) {
            docs.params[index].type = this.getTypeFromAnnotation(typeAnnotation);
          }
        }
      });
    }

    return docs;
  }

  parseDocLine(line, docs) {
    if (line.startsWith('@param')) {
      const paramMatch = line.match(/@param\s+{([^}]+)}\s+(\w+)\s+(.*)/);
      if (paramMatch) {
        docs.params.push({
          type: paramMatch[1],
          name: paramMatch[2],
          description: paramMatch[3],
        });
      }
    } else if (line.startsWith('@returns')) {
      const returnMatch = line.match(/@returns\s+{([^}]+)}\s+(.*)/);
      if (returnMatch) {
        docs.returns = {
          type: returnMatch[1],
          description: returnMatch[2],
        };
      }
    } else if (line.startsWith('@throws')) {
      const throwsMatch = line.match(/@throws\s+{([^}]+)}\s+(.*)/);
      if (throwsMatch) {
        docs.throws.push({
          type: throwsMatch[1],
          description: throwsMatch[2],
        });
      }
    } else if (line.startsWith('@example')) {
      docs.examples.push(this.parseExample(line));
    } else if (!line.startsWith('@')) {
      docs.description += line + '\n';
    }
  }

  getTypeFromAnnotation(typeAnnotation) {
    if (t.isTSTypeReference(typeAnnotation)) {
      return typeAnnotation.typeName.name;
    } else if (t.isTSUnionType(typeAnnotation)) {
      return typeAnnotation.types.map(type => this.getTypeFromAnnotation(type)).join(' | ');
    }
    return 'any';
  }

  parseExample(line) {
    const exampleMatch = line.match(/@example\s+(.*)/);
    if (exampleMatch) {
      return exampleMatch[1];
    }
    return '';
  }

  generateOutput() {
    switch (this.options.format) {
      case 'markdown':
        this.generateMarkdown();
        break;
      case 'json':
        this.generateJSON();
        break;
      default:
        throw new Error(`Unsupported output format: ${this.options.format}`);
    }
  }

  generateMarkdown() {
    let markdown = '# API Documentation\n\n';

    Object.values(this.apiDocs).forEach(classDoc => {
      markdown += `## ${classDoc.name}\n\n`;
      markdown += `${classDoc.description}\n\n`;

      Object.values(classDoc.methods).forEach(method => {
        markdown += `### ${method.name}\n\n`;
        markdown += `${method.description}\n\n`;

        if (method.params.length > 0) {
          markdown += '#### Parameters\n\n';
          markdown += '| Name | Type | Description |\n';
          markdown += '|------|------|-------------|\n';
          method.params.forEach(param => {
            markdown += `| ${param.name} | ${param.type} | ${param.description} |\n`;
          });
          markdown += '\n';
        }

        if (method.returns) {
          markdown += '#### Returns\n\n';
          markdown += `${method.returns.type} - ${method.returns.description}\n\n`;
        }

        if (method.throws.length > 0) {
          markdown += '#### Throws\n\n';
          method.throws.forEach(throws => {
            markdown += `- ${throws.type}: ${throws.description}\n`;
          });
          markdown += '\n';
        }

        if (method.examples.length > 0) {
          markdown += '#### Examples\n\n';
          method.examples.forEach(example => {
            markdown += '```javascript\n';
            markdown += example + '\n';
            markdown += '```\n\n';
          });
        }
      });
    });

    writeFileSync(
      resolve(this.options.outputDir, 'api.md'),
      markdown,
      'utf-8'
    );
  }

  generateJSON() {
    writeFileSync(
      resolve(this.options.outputDir, 'api.json'),
      JSON.stringify(this.apiDocs, null, 2),
      'utf-8'
    );
  }
}

export default APIDocGenerator; 