# bcgov/landuseplanning-public

Public front-end for the Land Use Planning application. Based on the PRC Application [bcgov/nrts-prc-public](https://github.com/bcgov/nrts-prc-public).

* [Admin](https://github.com/bcgov/landuseplanning-admin) - front-end for admin users.
* [Public](https://github.com/bcgov/landuseplanning-public) - front-end for public users.
* [Api](https://github.com/bcgov/landuseplanning-api) - back-end that serves both admin and public requests.

# Prerequisites

| Technology | Version | Website                 | Description |
|------------|---------|-------------------------|-------------------------------------------|
| node       | 8.x.x   | https://nodejs.org/en/  | JavaScript Runtime                        |
| npm        | 6.x.x   | https://www.npmjs.com/  | Node Package Manager                      |
| ng         | 6.x.x   | https://cli.angular.io/ | Angular CLI                               |
| yarn       | latest  | https://yarnpkg.com/en/ | Package Manager (more efficient than npm) |

_Note: This app also requires [bcgov/landuseplanning-api](https://github.com/bcgov/landuseplanning-api) to handle its requests._

## Install [Node + NPM](https://nodejs.org/en/)

_Note: Windows users can use [NVM Windows](https://github.com/coreybutler/nvm-windows) to install and manage multiple versions of Node+Npm._

## Install [Angular CLI](https://cli.angular.io/)

_Note: Use `@angular/cli`. Do not use `@angular/angular-cli`._

```
npm install -g @angular/cli
```

## Install [Yarn](https://yarnpkg.com/lang/en/docs/install/#alternatives-tab)

```
npm install -g yarn
```

# Build and Run

## Dev
1. Download dependencies
```
yarn install
```
2. Run the app
```
npm start
```
3. Go to http://localhost:4300 to verify that the application is running

    _Note: To change the default port edit `angular.json`._

## Prod
1. Download dependencies
```
yarn install
```
2. Run the build

   The build artifacts will be stored in the `./dist/` directory.
```
npm run build
```
3. (Optional) Use the `--prod` flag to run the app in prod mode
```
ng serve --prod
```

# Linting and Formatting

## Info

Linting and formatting is handled by a combiation of `TSlint` and `Prettier`.  The reason for this, is that you get the best of both worlds: TSlint's larger selection of linting rules with Prettier's robust formatting rules.

These 2 linters (tslint, Prettier) do have overlapping rules.  To avoid weird rule interactions, TSlint has been configured to defer any overlapping rules to Prettier, via the use of `tslint-config-prettier` in `tslint.json`.

Recommend installing the [VSCode Prettier extension](https://github.com/prettier/prettier-vscode), so Prettier's formatting can be applied on-the-fly.

### Technolgies used

[TSLint](https://palantir.github.io/tslint/), [Prettier](https://prettier.io/), [Stylelint](https://stylelint.io/), [husky](https://www.npmjs.com/package/husky), [lint-staged](https://github.com/okonet/lint-staged)

### Configuration files

* TSlint: tslint.json
* Prettier: .prettierrc .prettierignore
* Stylelint: .styleintrc
* Husky: package.json
* lint-staged: package.json

### Pre-Commit Hooks

Package.json has been configured to use `husky`/`lint-staged` to run the `lint-fix` (linting + formatting) commands, against the files staged to be committed, whenever you perform a commit.  This ensures that all committed code has been linted and formatted correctly.

If the linters or formatters find issues that cannot be automatically fixed, it will throw an error and provide output as to what is wrong.  Fix the issues and commit again.

## Run Linters

* Lint the `*.ts` files using `TSLint`.
```
npm run lint:ts
```
* Lint the `*.scss` files using `Stylelint`.
```
npm run lint:scss
```
* Run all linters in series
```
npm run lint
```

## Run Linters + Formatters

_Note: In the worst case scenario, where linting/formatting has been neglected, then these `lint-fix` commands have the potential to create 100's of file changes.  In this case, it is recommended to only run these commands as part of a separate commit._

_Note: Not all linting/formatting errors can be automatically fixed, and will require human intervention._

* Lint and fix the `*.ts` files using `TSLint` + `Prettier`.

```
npm run lint-fix:ts
```
* Lint and fix the `*.scss` files using `Stylelint`.
```
npm run lint-fix:scss
```
* Run all linters and fix all problems, in series
```
npm run lint-fix
```

# Testing

## Info

### Technolgies used

[Jasmine](https://jasmine.github.io/), [Karma](https://karma-runner.github.io/latest/index.html), [Protractor](http://www.protractortest.org/)

## Run Tests

* Run the unit tests with `watch=true`

```
npm run tests
```
* Run the unit tests with `watch=false`
```
npm run tests-ci
```
* Run the end-to-end tests

  Before running the tests make sure you are serving the app via `ng serve`.
```
npm run e2e
```

### Running a single test

It is possible to run a single `describe` or `it`  block by changing it to `fdescribe` or `fit` respectively. The prepended `f` stands for "focus." As of Oct. 13, 2022, the version of Karma we're using only provides this method of running portions of the test code. For example:

```
fdescribe('Example test block', () => {
  it('Checks the veractiy of "true"', () => {
    expect(true).toBeTruthy();
  });
});
```

Now if you run `ng test`, only this `fdescribe` block will run.

# Code Scaffolding Using Angular CLI

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|module`.

### Example: Generate a customer component

```
ng g c customer
```

### Example: Generate a directive: search-box

```
ng g d search-box
```

### Example: Generate a service: general-data

```
ng g s general-data
```

Angular will give out a warning line after this command:

> WARNING Service is generated but not provided, it must be provided to be used

After generating a service, we must go to its owning module and add the service to the `providers` array.

### Example: Generate a service and include it in a module automatically

A brief guide to Angular CLI's code scaffolding can be found in [eagle-dev-guides](https://github.com/bcgov/eagle-dev-guides/blob/master/dev_guides/angular_scaffolding.md)

### Example: Generate a class, an interface and enum

```
# class
ng g cl models/customer

# interface
ng g i models/person

# enum
ng g enum models/gender
```

### Example: Generate a pipe

```
ng g pipe shared/init-caps
```

## Generate a module

Create a login directory and generate a login module in that directory.

```
ng g module login/login.module
```

## Add/Generate Routing Features

Generate a module called admin and add routing feature to it.

```
ng g module admin --routing
```

## Change aspects of the application

### Change style dialect

```
ng set default.styleExt css
```

## Regenerate a brand new project with routing and scss options

```
ng new my-app --routing --style scss
```

For dev, test, and production builds on OpenShift/Jenkins see [openshift/README.md](https://github.com/bcgov/eagle-public/blob/master/openshift/README.md) for detailed instructions on how to setup in an OpenShift environment using nginx. -->

# Testing

An overview of the EPIC test stack can be found in our documentation guides: [EPIC Test Stack](https://github.com/bcgov/eagle-dev-guides/blob/master/dev_guides/testing_components.md).

Instructions on how running tests unit tests and end-to-end tests can be found in our [test documentation](https://github.com/bcgov/eagle-dev-guides/blob/master/dev_guides/angular_scaffolding.md#running-tests).

# How to Contribute

Feel free to create pull requests from the default "develop" branch, click here to create one automatically: https://github.com/bcgov/eagle-public/pull/new/develop 
