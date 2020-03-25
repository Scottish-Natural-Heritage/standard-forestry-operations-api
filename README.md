# standard-forestry-operations-api

Apply for a Standard Forestry Operations licence

## Develop

```sh
npm run dev
```

## Test

```sh
npm run test
```

## Debug

### `.vscode/launch.json`

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "runtimeArgs": [
        "--experimental-modules"
      ],
      "request": "launch",
      "name": "Launch Program",
      "skipFiles": [
        "<node_internals>/**"
      ],
      "program": "${workspaceFolder}\\src\\server.js",
      "env": {
        "SFO_API_PORT": "3003",
        "SFO_API_PATH_PREFIX": "standard-forestry-operations-api",
        "LICENSING_DB_PASS": "ChangeMeFromCorrectHorseBatteryStaple",
        "SFO_DB_PASS": "ChangeMeFromHunter2"
      }
    }
  ]
}
```

## License

Unless stated otherwise, the codebase is released under the [MIT License](LICENSE.txt). The documentation is available under the terms of the [Open Government Licence, Version 3](LICENSE-OGL.md).
