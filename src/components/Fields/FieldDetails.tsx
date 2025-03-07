import * as React from 'react';

import {
  NullableLabel,
  PatternLabel,
  RecursiveLabel,
  TypeFormat,
  TypeName,
  TypePrefix,
  TypeTitle,
  ToggleButton,
} from '../../common-elements/fields';
import { serializeParameterValue } from '../../utils/openapi';
import { ExternalDocumentation } from '../ExternalDocumentation/ExternalDocumentation';
import { Markdown } from '../Markdown/Markdown';
import { EnumValues } from './EnumValues';
import { Extensions } from './Extensions';
import { FieldProps } from './Field';
import { ConstraintsView } from './FieldContstraints';
import { FieldDetail } from './FieldDetail';

import { Badge, FinastraBadge } from '../../common-elements/';

import { l } from '../../services/Labels';
import { OptionsContext } from '../OptionsProvider';

const MAX_PATTERN_LENGTH = 45;

export class FieldDetails extends React.PureComponent<FieldProps, { patternShown: boolean }> {
  state = {
    patternShown: false,
  };

  static contextType = OptionsContext;

  togglePattern = () => {
    this.setState({
      patternShown: !this.state.patternShown,
    });
  };

  render() {
    const { showExamples, field, renderDiscriminatorSwitch } = this.props;
    const { patternShown } = this.state;
    const { enumSkipQuotes, hideSchemaTitles } = this.context;

    const { schema, description, example, deprecated, dataClassification } = field;

    const rawDefault = !!enumSkipQuotes || field.in === 'header'; // having quotes around header field default values is confusing and inappropriate

    let exampleField: JSX.Element | null = null;

    if (showExamples && example !== undefined) {
      const label = l('example') + ':';
      if (field.in && (field.style || field.serializationMime)) {
        // decode for better readability in examples: see https://github.com/Redocly/redoc/issues/1138
        const serializedValue = decodeURIComponent(serializeParameterValue(field, example));
        exampleField = <FieldDetail label={label} value={serializedValue} raw={true} />;
      } else {
        exampleField = <FieldDetail label={label} value={example} />;
      }
    }

    return (
      <div>
        <div>
          <TypePrefix>{schema.typePrefix}</TypePrefix>
          <TypeName>{schema.displayType}</TypeName>
          {schema.displayFormat && (
            <TypeFormat>
              {' '}
              &lt;
              {schema.displayFormat}
              &gt;{' '}
            </TypeFormat>
          )}
          {schema.title && !hideSchemaTitles && <TypeTitle> ({schema.title}) </TypeTitle>}

          <ConstraintsView constraints={schema.constraints} />
          {dataClassification &&
            dataClassification.map((item) => (
              <FinastraBadge type="dataClassificationField" className="field-data-classification">
                {' '}
                {item}{' '}
              </FinastraBadge>
            ))}
          {schema.nullable && <NullableLabel> {l('nullable')} </NullableLabel>}
          {schema.pattern && (
            <>
              <PatternLabel>
                {patternShown || schema.pattern.length < MAX_PATTERN_LENGTH
                  ? schema.pattern
                  : `${schema.pattern.substr(0, MAX_PATTERN_LENGTH)}...`}
              </PatternLabel>
              {schema.pattern.length > MAX_PATTERN_LENGTH && (
                <ToggleButton onClick={this.togglePattern}>
                  {patternShown ? 'Hide pattern' : 'Show pattern'}
                </ToggleButton>
              )}
            </>
          )}
          {schema.isCircular && <RecursiveLabel> {l('recursive')} </RecursiveLabel>}
        </div>
        {deprecated && (
          <div>
            <Badge type="warning"> {l('deprecated')} </Badge>
          </div>
        )}
        <FieldDetail raw={rawDefault} label={l('default') + ':'} value={schema.default} />
        {!renderDiscriminatorSwitch && <EnumValues type={schema.type} values={schema.enum} />}{' '}
        {exampleField}
        {<Extensions extensions={{ ...field.extensions, ...schema.extensions }} />}
        <div>
          <Markdown compact={true} source={description} />
        </div>
        {schema.externalDocs && (
          <ExternalDocumentation externalDocs={schema.externalDocs} compact={true} />
        )}
        {(renderDiscriminatorSwitch && renderDiscriminatorSwitch(this.props)) || null}
      </div>
    );
  }
}
