import getItemModelName from 'appkit/utils/model';
import validateControl from 'appkit/utils/validators';

export default Ember.ObjectController.extend({

  // Run validators on every change.
  valueChanged: function () {
    this.get('model.controls').forEach(validateControl);
  }.observes('model.controls.@each.value'),

  saveItem: function () {

    if (!this.get('model.controls').isEvery('isValid')) {
      window.alert('Fix your problems.');
      return;
    }

    var data = {};

    // gather and clean data for storage
    this.get('model.controls').filterBy('value').forEach(function (control) {
      var value = control.get('value');

      if (control.get('controlType.valueType') === 'object') {
        Ember.$.each(value, function (key, childValue) {
          if (!childValue) {
            delete value[key];
          }
        });
      }

      data[control.get('name')] = value;
    });

    // checkboxes are special
    this.get('model.controls').filterBy('controlType.widget', 'checkbox').forEach(function (control) {
      data[control.get('name')] = [];
      control.get('meta.data.options').forEach(function (option) {
        data[control.get('name')].push(option);
      });
    });

    var modelName = getItemModelName(this.get('model'));

    this.store.createRecord(modelName, {
      data: data
    }).save().then(function () {
      window.ENV.sendBuildSignal();

      this.send('notify', 'success', 'Item created!');
      this.transitionToRoute('wh.content.type', this.get('model'));
    }.bind(this));

  }

});
