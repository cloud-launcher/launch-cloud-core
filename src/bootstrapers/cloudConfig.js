import templates from '../templates';

module.exports = () => {
  return loadTemplates(['cloudConfig', 'bootstrap']);

  function loadTemplates(templates) {
    return _.reduce(templates, (result, templateName) => {
      result[templateName + 'Template'] = hogan.compile(templates[templateName]);
      return result;
    }, {});
  }
};