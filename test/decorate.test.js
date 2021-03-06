import React from 'react';
import TestUtils from 'react-addons-test-utils';
import { expect } from 'chai';

import FormLogic from '../src';

describe('FormLogic component decorator', () => {
  describe('dealing with client-side validations', () => {
    function render() {
      const form = FormLogic.Form({
        fields: {
          email: FormLogic.Field({ presence: true }),
          password: FormLogic.Field({ presence: true })
        }
      });

      const FormComponent = (props) => (<form></form>);
      const DecoratedFormComponent = FormLogic.decorate(form, FormComponent);

      const shallowRenderer = TestUtils.createRenderer();
      shallowRenderer.render(React.createElement(DecoratedFormComponent));

      return shallowRenderer.getRenderOutput();
    }

    it('handles form change event', () => {
      const rendered = render();
      const formLogicComponent = rendered.props.children;
      
      formLogicComponent.props.formProps.onChange({ target: { tagName: 'INPUT', name: 'email', value: '' } });

      const form = formLogicComponent.props.form;

      const expectedErrors = [{
        key: "blank",
        message: "can't be blank"
      }];

      expect(form.fields.email.errors).to.deep.equal(expectedErrors);
    });
  });

  describe('dealing with server-side validations', () => {
    function render() {
      const form = FormLogic.Form({
        name: 'Form',
        fields: {
          email: FormLogic.Field({ presence: true }),
          password: FormLogic.Field({ presence: true })
        }
      });

      const FormComponent = (props) => (<form></form>);
      const DecoratedFormComponent = FormLogic.decorate(form, FormComponent);

      const shallowRenderer = TestUtils.createRenderer();
      shallowRenderer.render(React.createElement(DecoratedFormComponent, {
        errors: {
          email: [
            {
              key: 'taken',
              message: 'already taken'
            }
          ]
        }
      }));

      return shallowRenderer.getRenderOutput();
    }

    it('injects server side errors', () => {
      const expectedErrors = [{ key: 'taken', message: 'already taken' }];
      const rendered = render();
      const formLogicComponent = rendered.props.children;

      const form = formLogicComponent.props.form;

      expect(form.fields.email.errors).to.deep.equal(expectedErrors);
    });

    it('formats the server errors', () => {
      FormLogic.configure({
        errorMessageFormat: (error, form, formState, fieldState) => {
          return `${form.name}: ${fieldState.name} is ${error.key}`;
        }
      });

      const expectedErrors = [
        {
          message: 'already taken',
          key: 'taken',
          formattedMessage: 'Form: email is taken'
        }
      ];

      const rendered = render();
      const formLogicComponent = rendered.props.children;
      const form = formLogicComponent.props.form;

      expect(form.fields.email.errors).to.deep.equal(expectedErrors);
    });
  });
});
