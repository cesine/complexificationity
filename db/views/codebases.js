'use strict';
/* globals emit */

exports = {
  _id: '_design/codebases',
  language: 'javascript',
  views: {
    public: {
      map: function(doc) {
        if (doc.fieldDBtype !== 'CodeBase') {
          return;
        }

        emit(doc._id, {
          title: doc.title || '',
          description: doc.description || '',
          gravatar: doc.gravatar || '',
          language: doc.language || '',
          complexificationity: doc.complexificationity
        });
      }
    },
    complexificationity: {
      map: function(doc) {
        if (doc.fieldDBtype !== 'CodeBase' || doc.trashed) {
          return;
        }

        var owner = doc._id.split('/')[0];
        emit(owner, doc.complexificationity);
        emit('CodeBase', doc.complexificationity);
      },
      /**
       * This computes the standard deviation of the mapped results
       * this function is taken directly from couchdb source code.
       * thanks, Damien!
       *
       * Licensed under the Apache License, Version 2.0 (the 'License'); you may not
       * use this file except in compliance with the License.  You may obtain a copy of
       * the License at
       *
       *   http://www.apache.org/licenses/LICENSE-2.0
       *
       * Unless required by applicable law or agreed to in writing, software
       * distributed under the License is distributed on an 'AS IS" BASIS, WITHOUT
       * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  See the
       * License for the specific language governing permissions and limitations under
       * the License.
       * @param  {[type]} keys     [description]
       * @param  {[type]} values   [description]
       * @param  {[type]} rereduce [description]
       * @return {[type]}          [description]
       */
      reduce: function(keys, values, rereduce) {
        var stdDeviation = 0.0;
        var count = 0;
        var total = 0.0;
        var sqrTotal = 0.0;
        var i;

        if (!rereduce) {
          // This is the reduce phase, we are reducing over emitted values from
          // the map functions.
          for (i in values) {
            total = total + values[i];
            sqrTotal = sqrTotal + (values[i] * values[i]);
          }
          count = values.length;
        } else {
          // This is the rereduce phase, we are re-reducing previosuly
          // reduced values.
          for (i in values) {
            count = count + values[i].count;
            total = total + values[i].total;
            sqrTotal = sqrTotal + values[i].sqrTotal;
          }
        }

        var variance = (sqrTotal - ((total * total) / count)) / count;
        stdDeviation = Math.sqrt(variance);

        // the reduce result. It contains enough information to be rereduced
        // with other reduce results.
        return {
          'stdDeviation': stdDeviation,
          'count': count,
          'total': total,
          'sqrTotal': sqrTotal
        };
      }
    }
  }
};
