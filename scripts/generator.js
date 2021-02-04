const fs = require('fs');
const path = require('path');
const swaggerDocument = require('../src/interfaces/http/swagger/swagger.json');
const isWin = process.platform === 'win32';

// constants to provive content inside files
const dir = process.argv[2];
const capitalDir = dir.charAt(0).toUpperCase() + dir.slice(1);

const deleteCrud = `const Operation = require('src/app/Operation');

class Delete${capitalDir} extends Operation {
  constructor({ ${dir}sRepository }) {
    super();
    this.${dir}sRepository = ${dir}sRepository;
  }

  async execute(${dir}Id) {
    const { SUCCESS, ERROR, NOT_FOUND } = this.outputs;

    try {
      await this.${dir}sRepository.remove(${dir}Id);
      this.emit(SUCCESS);
    } catch(error) {
      if(error.message === 'NotFoundError') {
        return this.emit(NOT_FOUND, error);
      }

      this.emit(ERROR, error);
    }
  }
}

Delete${capitalDir}.setOutputs(['SUCCESS', 'ERROR', 'NOT_FOUND']);

module.exports = Delete${capitalDir};
`;
const createCrud = `const Operation = require('src/app/Operation');
const ${capitalDir} = require('src/domain/${dir}/${capitalDir}');

class Create${capitalDir} extends Operation {
  constructor({ ${dir}sRepository }) {
    super();
    this.${dir}sRepository = ${dir}sRepository;
  }

  async execute(${dir}Data) {
    const { SUCCESS, ERROR, VALIDATION_ERROR } = this.outputs;

    const ${dir} = new ${capitalDir}(${dir}Data);

    try {
      const new${capitalDir} = await this.${dir}sRepository.create(${dir});

      this.emit(SUCCESS, new${capitalDir});
    } catch(error) {
      if(error.message === 'ValidationError') {
        return this.emit(VALIDATION_ERROR, error);
      }

      this.emit(ERROR, error);
    }
  }
}

Create${capitalDir}.setOutputs(['SUCCESS', 'ERROR', 'VALIDATION_ERROR']);

module.exports = Create${capitalDir};
`;
const updateCrud = `const Operation = require('src/app/Operation');

class Update${capitalDir} extends Operation {
  constructor({ ${dir}sRepository }) {
    super();
    this.${dir}sRepository = ${dir}sRepository;
  }

  async execute(${dir}Id, ${dir}Data) {
    const {
      SUCCESS, NOT_FOUND, VALIDATION_ERROR, ERROR
    } = this.outputs;

    try {
      const ${dir} = await this.${dir}sRepository.update(${dir}Id, ${dir}Data);
      this.emit(SUCCESS, ${dir});
    } catch(error) {
      switch(error.message) {
      case 'ValidationError':
        return this.emit(VALIDATION_ERROR, error);
      case 'NotFoundError':
        return this.emit(NOT_FOUND, error);
      default:
        this.emit(ERROR, error);
      }
    }
  }
}

Update${capitalDir}.setOutputs(['SUCCESS', 'NOT_FOUND', 'VALIDATION_ERROR', 'ERROR']);

module.exports = Update${capitalDir};
`;
const getCrud = `const Operation = require('src/app/Operation');

class Get${capitalDir} extends Operation {
  constructor({ ${dir}sRepository }) {
    super();
    this.${dir}sRepository = ${dir}sRepository;
  }

  async execute(${dir}Id) {
    const { SUCCESS, NOT_FOUND } = this.outputs;

    try {
      const ${dir} = await this.${dir}sRepository.getById(${dir}Id);
      this.emit(SUCCESS, ${dir});
    } catch(error) {
      this.emit(NOT_FOUND, {
        type: error.message,
        details: error.details
      });
    }
  }
}

Get${capitalDir}.setOutputs(['SUCCESS', 'ERROR', 'NOT_FOUND']);

module.exports = Get${capitalDir};
`;
const getAllCrud = `const Operation = require('src/app/Operation');

class GetAll${capitalDir}s extends Operation {
  constructor({ ${dir}sRepository }) {
    super();
    this.${dir}sRepository = ${dir}sRepository;
  }

  async execute() {
    const { SUCCESS, ERROR } = this.outputs;

    try {
      const ${dir}s = await this.${dir}sRepository.getAll({});

      this.emit(SUCCESS, ${dir}s);
    } catch(error) {
      this.emit(ERROR, error);
    }
  }
}

GetAll${capitalDir}s.setOutputs(['SUCCESS', 'ERROR']);

module.exports = GetAll${capitalDir}s;
`;
const index = `module.exports = {
  GetAll${capitalDir}s: require('./GetAll${capitalDir}s'),
  Create${capitalDir}: require('./Create${capitalDir}'),
  Get${capitalDir}: require('./Get${capitalDir}'),
  Update${capitalDir}: require('./Update${capitalDir}'),
  Delete${capitalDir}: require('./Delete${capitalDir}')
};
`;
const domain = `const { attributes } = require('structure');

const ${capitalDir} = attributes({
  id: String,
  name: String
})(
  class ${capitalDir} {
  }
);

module.exports = ${capitalDir};
`;
const model = `'use strict';
const mongoose_delete = require('mongoose-delete');
module.exports = function (mongoose) {
  const { Schema } = mongoose;
  const ${capitalDir}Schema = new Schema({
    name: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  });

  ${capitalDir}Schema.plugin(mongoose_delete, {
    deletedAt: true,
    overrideMethods: true,
  });
  const ${capitalDir} = mongoose.model('${dir}', ${capitalDir}Schema);

  return ${capitalDir};
};
`;
const repository = `const ${capitalDir}Mapper = require('./Mongoose${capitalDir}Mapper');

class Mongoose${capitalDir}sRepository {
  constructor({ ${capitalDir}Model }) {
    this.${capitalDir}Model = ${capitalDir}Model;
  }

  async getAll(...args) {
    const ${dir}s = await this.${capitalDir}Model.find(...args);
    return ${dir}s.map(${capitalDir}Mapper.toEntity);
  }

  async getById(id) {
    const ${dir} = await this._getById(id);
    return ${capitalDir}Mapper.toEntity(${dir});
  }

  async create(${dir}) {
    const { valid, errors } = ${dir}.validate();
    if (!valid) {
      const error = new Error('ValidationError');
      error.details = errors;

      throw error;
    }

    const new${capitalDir} = await this.${capitalDir}Model.create(${capitalDir}Mapper.toDatabase(${dir}));
    return ${capitalDir}Mapper.toEntity(new${capitalDir});
  }


  async remove(_id) {
    await this.${capitalDir}Model.delete({ _id });
    return;
  }

  async update(_id, newData) {
    const updated${capitalDir} = await this.${capitalDir}Model.findOneAndUpdate({_id}, newData);
    
    if (!updated${capitalDir}) {
      const notFoundError = new Error('NotFoundError');
      notFoundError.details = \`${capitalDir} with id \${_id} can't be found.\`;
      throw notFoundError;
    }

    const ${dir}Entity = ${capitalDir}Mapper.toEntity(updated${capitalDir});
    return ${dir}Entity;
  }

  async count() {
    return await this.${capitalDir}Model.count();
  }

  async _getById(_id) {
    try {
      return await this.${capitalDir}Model.findOne({ _id });
    } catch (error) {
      if (error.name === 'SequelizeEmptyResultError') {
        const notFoundError = new Error('NotFoundError');
        notFoundError.details = \`${capitalDir} with id \${_id} can't be found.\`;

        throw notFoundError;
      }

      throw error;
    }
  }
}

module.exports = Mongoose${capitalDir}sRepository;
`;
const mapper = `const ${capitalDir} = require('src/domain/${dir}/${capitalDir}');

const Mongoose${capitalDir}Mapper = {
  toEntity({ _id: id, name }) {
    return new ${capitalDir}({ id, name });
  },

  toDatabase(survivor) {
    const { name } = survivor;

    return { name };
  },
};

module.exports = Mongoose${capitalDir}Mapper;
`;
const controller = `const { Router } = require('express');
const { inject } = require('awilix-express');
const Status = require('http-status');

const ${capitalDir}sController = {
  get router() {
    const router = Router();

    router.use(inject('${dir}Serializer'));

    router.get('/', inject('getAll${capitalDir}s'), this.index);
    router.get('/:id', inject('get${capitalDir}'), this.show);
    router.post('/', inject('create${capitalDir}'), this.create);
    router.put('/:id', inject('update${capitalDir}'), this.update);
    router.delete('/:id', inject('delete${capitalDir}'), this.delete);

    return router;
  },

  index(req, res, next) {
    const { getAll${capitalDir}s, ${dir}Serializer } = req;
    const { SUCCESS, ERROR } = getAll${capitalDir}s.outputs;

    getAll${capitalDir}s
      .on(SUCCESS, (${dir}s) => {
        res.status(Status.OK).json(${dir}s.map(${dir}Serializer.serialize));
      })
      .on(ERROR, next);

    getAll${capitalDir}s.execute();
  },

  show(req, res, next) {
    const { get${capitalDir}, ${dir}Serializer } = req;

    const { SUCCESS, ERROR, NOT_FOUND } = get${capitalDir}.outputs;

    get${capitalDir}
      .on(SUCCESS, (${dir}) => {
        res.status(Status.OK).json(${dir}Serializer.serialize(${dir}));
      })
      .on(NOT_FOUND, (error) => {
        res.status(Status.NOT_FOUND).json({
          type: 'NotFoundError',
          details: error.details,
        });
      })
      .on(ERROR, next);

    get${capitalDir}.execute(req.params.id);
  },

  create(req, res, next) {
    const { create${capitalDir}, ${dir}Serializer } = req;
    const { SUCCESS, ERROR, VALIDATION_ERROR } = create${capitalDir}.outputs;

    create${capitalDir}
      .on(SUCCESS, (${dir}) => {
        res.status(Status.CREATED).json(${dir}Serializer.serialize(${dir}));
      })
      .on(VALIDATION_ERROR, (error) => {
        res.status(Status.BAD_REQUEST).json({
          type: 'ValidationError',
          details: error.details,
        });
      })
      .on(ERROR, next);

    create${capitalDir}.execute(req.body);
  },

  update(req, res, next) {
    const { update${capitalDir}, ${dir}Serializer } = req;
    const { SUCCESS, ERROR, VALIDATION_ERROR, NOT_FOUND } = update${capitalDir}.outputs;

    update${capitalDir}
      .on(SUCCESS, (${dir}) => {
        res.status(Status.ACCEPTED).json(${dir}Serializer.serialize(${dir}));
      })
      .on(VALIDATION_ERROR, (error) => {
        res.status(Status.BAD_REQUEST).json({
          type: 'ValidationError',
          details: error.details,
        });
      })
      .on(NOT_FOUND, (error) => {
        res.status(Status.NOT_FOUND).json({
          type: 'NotFoundError',
          details: error.details,
        });
      })
      .on(ERROR, next);

    update${capitalDir}.execute(req.params.id, req.body);
  },

  delete(req, res, next) {
    const { delete${capitalDir} } = req;
    const { SUCCESS, ERROR, NOT_FOUND } = delete${capitalDir}.outputs;

    delete${capitalDir}
      .on(SUCCESS, () => {
        res.status(Status.ACCEPTED).end();
      })
      .on(NOT_FOUND, (error) => {
        res.status(Status.NOT_FOUND).json({
          type: 'NotFoundError',
          details: error.details,
        });
      })
      .on(ERROR, next);

    delete${capitalDir}.execute(req.params.id);
  },
};

module.exports = ${capitalDir}sController;
`;
const serializer = `const ${capitalDir}Serializer = {
  serialize({ id, name }) {
    return {
      id,
      name
    };
  }
};
 
module.exports = ${capitalDir}Serializer;
`;

// create required directory and files for entity
fs.mkdir(
  path.join(__dirname, `../src/app/${dir}`),
  { recursive: true },
  (err) =>
    err
      ? console.error(err)
      : console.log(`src/app/${dir} Directory created successfully!`)
);

fs.writeFile(
  path.join(__dirname, `../src/app/${dir}/Delete${capitalDir}.js`),
  deleteCrud,
  (err) =>
    err
      ? console.error(err)
      : console.log(`Delete${capitalDir} file created successfully!`)
);
fs.writeFile(
  path.join(__dirname, `../src/app/${dir}/Create${capitalDir}.js`),
  createCrud,
  (err) =>
    err
      ? console.error(err)
      : console.log(`Create${capitalDir} file created successfully!`)
);
fs.writeFile(
  path.join(__dirname, `../src/app/${dir}/Update${capitalDir}.js`),
  updateCrud,
  (err) =>
    err
      ? console.error(err)
      : console.log(`Update${capitalDir} file created successfully!`)
);
fs.writeFile(
  path.join(__dirname, `../src/app/${dir}/Get${capitalDir}.js`),
  getCrud,
  (err) =>
    err
      ? console.error(err)
      : console.log(`Get${capitalDir} file created successfully!`)
);
fs.writeFile(
  path.join(__dirname, `../src/app/${dir}/GetAll${capitalDir}s.js`),
  getAllCrud,
  (err) =>
    err
      ? console.error(err)
      : console.log(`GetAll${capitalDir} file created successfully!`)
);

fs.writeFile(
  path.join(__dirname, `../src/app/${dir}/index.js`),
  index,
  (err) =>
    err
      ? console.error(err)
      : console.log('index file created successfully!')
);

// create domain class
fs.mkdir(
  path.join(__dirname, `../src/domain/${dir}`),
  { recursive: true },
  (err) =>
    err
      ? console.error(err)
      : console.log(`src/domain/${dir} Directory created successfully!`)
);

fs.writeFile(
  path.join(__dirname, `../src/domain/${dir}/${capitalDir}.js`),
  domain,
  (err) =>
    err
      ? console.error(err)
      : console.log(`src/domain/${capitalDir}.js file created successfully!`)
);

// create databse model
fs.writeFile(
  path.join(__dirname, `../src/infra/database/models/${capitalDir}.js`),
  model,
  (err) =>
    err
      ? console.error(err)
      : console.log(`src/infra/database/models/${capitalDir}.js file created successfully!`)
);

// create repository
fs.mkdir(
  path.join(__dirname, `../src/infra/${dir}`),
  { recursive: true },
  (err) =>
    err
      ? console.error(err)
      : console.log(`src/infra/${dir} Directory created successfully!`)
);
fs.writeFile(
  path.join(
    __dirname,
    `../src/infra/${dir}/Mongoose${capitalDir}sRepository.js`
  ),
  repository,
  (err) =>
    err
      ? console.error(err)
      : console.log(`src/infra/${dir}/Mongoose${capitalDir}sRepository.js file created successfully!`)
);
fs.writeFile(
  path.join(__dirname, `../src/infra/${dir}/Mongoose${capitalDir}Mapper.js`),
  mapper,
  (err) =>
    err
      ? console.error(err)
      : console.log(`src/infra/${dir}/Mongoose${capitalDir}Mapper.js file created successfully!`)
);

// create controller
fs.mkdir(
  path.join(__dirname, `../src/interfaces/http/${dir}`),
  { recursive: true },
  (err) =>
    err
      ? console.error(err)
      : console.log(`/src/interfaces/http/${dir} Directory created successfully!`)
);
fs.writeFile(
  path.join(
    __dirname,
    `../src/interfaces/http/${dir}/${capitalDir}sController.js`
  ),
  controller,
  (err) =>
    err
      ? console.error(err)
      : console.log(`src/interfaces/http/${dir}/${capitalDir}sController.js file created successfully!`)
);
fs.writeFile(
  path.join(
    __dirname,
    `../src/interfaces/http/${dir}/${capitalDir}Serializer.js`
  ),
  serializer,
  (err) =>
    err
      ? console.error(err)
      : console.log(`src/interfaces/http/${dir}/${capitalDir}Serializer.js file created successfully!`)
);

//router
const newController = `  apiRouter.use('/${dir}s', controller('${dir}/${capitalDir}sController'));`;

let routerText = fs
  .readFileSync(path.join(__dirname, '../src/interfaces/http/router.js'))
  .toString()
  .split('\n');
routerText.splice(40, 0, newController);
const routerResult = routerText.join('\n');

fs.writeFile(
  path.join(__dirname, '../src/interfaces/http/router.js'),
  routerResult,
  function (err) {
    err ? console.log(err) : console.log('Router Updated');
  }
);

// container
const containerModelImport = `  ${capitalDir}: ${capitalDir}Model,`;
const containerImports =
`const {Create${capitalDir}, GetAll${capitalDir}s, Get${capitalDir}, Update${capitalDir}, Delete${capitalDir}} = require('./app/${dir}');
const ${capitalDir}Serializer = require('./interfaces/http/${dir}/${capitalDir}Serializer');
const Mongoose${capitalDir}sRepository = require('./infra/${dir}/Mongoose${capitalDir}sRepository');
`;
const containerRepository = `  ${dir}sRepository: asClass(Mongoose${capitalDir}sRepository).singleton(),`;
const containerDatabase = `  ${capitalDir}Model: asValue(${capitalDir}Model),`;
const containerOperations = 
`  create${capitalDir}: asClass(Create${capitalDir}),
  get${capitalDir}: asClass(Get${capitalDir}),
  update${capitalDir}: asClass(Update${capitalDir}),
  delete${capitalDir}: asClass(Delete${capitalDir}),
  getAll${capitalDir}s: asClass(GetAll${capitalDir}s),
`;
const containerSerializers = `  ${dir}Serializer: asValue(${capitalDir}Serializer),`;

const flag = isWin ? '\r\n' : '\n';
let ContainerText = fs
  .readFileSync(path.join(__dirname, '../src/container.js'))
  .toString()
  .split(flag);

ContainerText.splice(ContainerText.indexOf('  User: UserModel,')+1, 0, containerModelImport);
ContainerText.splice(ContainerText.indexOf('const MongooseUsersRepository = require(\'./infra/user/MongooseUsersRepository\');')+2, 0, containerImports);
ContainerText.splice(ContainerText.indexOf('// Repositories')+2, 0, containerRepository);
ContainerText.splice(ContainerText.indexOf('// Database')+2, 0, containerDatabase);
ContainerText.splice(ContainerText.indexOf('// Operations')+2, 0, containerOperations);
ContainerText.splice(ContainerText.indexOf('// Serializers')+2, 0, containerSerializers);

const containerResult = ContainerText.join('\n');

fs.writeFile(
  path.join(__dirname, '../src/container.js'),
  containerResult,
  function (err) {
    err ? console.log(err) : console.log('Container updated');
  }
);

//swagger
//paths
swaggerDocument.paths[`/${dir}s/`] = {
  'get': {
    'operationId': `list${capitalDir}`,
    'tags': [`${capitalDir}`],
    'responses': {
      '200': {
        'description': `list of all ${capitalDir}`,
        'content': {
          'application/json': {
            'schema': {
              'type': 'array',
              'items': {
                '$ref': `#/components/schemas/New${capitalDir}`
              }
            }
          }
        }
      }
    }
  },
  'post': {
    'operationId': `register${capitalDir}`,
    'tags': [
      `${capitalDir}`
    ],
    'requestBody': {
      'description': `${capitalDir} data`,
      'required': true,
      'content': {
        'application/json': {
          'schema': {
            '$ref': `#/components/schemas/New${capitalDir}`
          }
        }
      }
    },
    'responses': {
      '201': {
        'description': `${capitalDir} created successfully`,
        'content': {
          'application/json': {
            'schema': {
              '$ref': `#/components/schemas/New${capitalDir}`
            }
          }
        }
      },
      '400': {
        'description': `${capitalDir} not created because of validation error`,
        'content': {
          'application/json': {
            'schema': {
              '$ref': '#/components/schemas/ValidationError'
            }
          }
        }
      }
    }
  }
};
  
swaggerDocument.paths[`/${dir}s/{id}`] = {
  'get': {
    'operationId': `show${capitalDir}`,
    'tags': [
      `${capitalDir}`
    ],
    'parameters': [
      {
        'name': 'id',
        'in': 'path',
        'description': `Id of ${dir} to show`,
        'required': true,
        'type': 'string'
      }
    ],
    'responses': {
      '200': {
        'description': `Return ${dir} with given id`,
        'content': {
          'application/json': {
            'schema': {
              '$ref': `#/components/schemas/New${capitalDir}`
            }
          }
        }
      },
      '404': {
        'description': `${capitalDir} not found`,
        'content': {
          'application/json': {
            'schema': {
              '$ref': '#/components/schemas/NotFoundError'
            }
          }
        }
      }
    }
  },
  'put': {
    'operationId': `update${capitalDir}`,
    'tags': [
      `${capitalDir}`
    ],
    'parameters': [
      {
        'name': 'id',
        'in': 'path',
        'description': `Id of ${dir} to update`,
        'required': true,
        'type': 'string',
      }
    ],
    'requestBody': {
      'description': `${capitalDir} new data`,
      'required': true,
      'content': {
        'application/json': {
          'schema': {
            '$ref': `#/components/schemas/New${capitalDir}`
          }
        }
      }
    },
    'responses': {
      '202': {
        'description': `${capitalDir} updated successfully`,
        'content': {
          'application/json': {
            'schema': {
              '$ref': `#/components/schemas/New${capitalDir}`
            }
          }
        }
      },
      '404': {
        'description': `${capitalDir} not found`,
        'content': {
          'application/json': {
            'schema': {
              '$ref': '#/components/schemas/NotFoundError'
            }
          }
        }
      }
    },
  },
  'delete': {
    'operationId': `delete${capitalDir}`,
    'tags': [
      `${capitalDir}`
    ],
    'parameters': [
      {
        'name': 'id',
        'in': 'path',
        'description': `Id of ${dir} to delete`,
        'required': true,
        'type': 'integer',
        'format': 'int64'
      }
    ],
    'responses': {
      '202': {
        'description': `${capitalDir} deleted successfully`
      },
      '404': {
        'description': `${capitalDir} not found`,
        'content': {
          'application/json': {
            'schema': {
              '$ref': '#/components/schemas/NotFoundError'
            }
          }
        }
      }
    }
  }
};
  
//schema
swaggerDocument.components.schemas[`New${capitalDir}`] = {
  'required': ['name'],
  'type': 'object',
  'properties': {
    'name': {'type': 'string'}
  }
};

fs.writeFile(path.join(__dirname, '../src/interfaces/http/swagger/swagger.json'), JSON.stringify(swaggerDocument), 
  function (err) {
    err ? console.log(err) : console.log('Swagger updated');
  });
  
