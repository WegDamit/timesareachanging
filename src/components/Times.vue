<template>
  <div>
     <q-card>
      <q-card-title class="text-left">
        Select a single project
      </q-card-title>

      <q-card-main>
        <p>Autocomplete:</p>
        <q-search v-model="workhour.project_title" placeholder="Start typing a project name">
          <q-autocomplete
            @search="searchProject"
            @selected="selectedProject"
            :min-characters="2"
          />
        </q-search>
      </q-card-main>
      <q-card-main>
        <p>Slect one from list:</p>
        <q-list>
          <q-item>
            <q-item-side icon="supervisor_account" />
            <q-item-main>
              <q-select
                class="no-margin"
                v-model="workhour.project_id"
                :options="selectOptions"
              />
            </q-item-main>
          </q-item>
          <q-item-separator />
        </q-list>
      </q-card-main>
    </q-card>

    <div class="row">
      <div v-for="project in projects">
        <q-card class="col-3 relative-position"
          :key="project._id"
          v-on:click="prjTileClick(project._id)"
          v-ripple
        >
          <q-card-title>
            {{project.title}}
          </q-card-title>
          <q-card-separator />
          <q-card-main>
            {{project.description}}
          </q-card-main>
        </q-card>
      </div>
    </div>

    <q-card>
      <q-list highlight >
        <q-list-header>Projects</q-list-header>
        <q-item v-for="project in projects" :key="project._id">
          <q-item-side left>
            <q-item-tile icon="directions_run" color="black" />
          </q-item-side>
          <q-item-main class="row xs-gutter" v-on:click="prjTileClick(project._id)" >
            <q-item-tile label class="col-4">{{project.title}}</q-item-tile>
            <q-item-tile sublabel class="col">{{project.description}}</q-item-tile>
            <q-item-tile v-if="project.range" class="col-auto">{{formatGenericDate(project.range.to, 'DD. MMM YY')}}</q-item-tile>
          </q-item-main>
        </q-item>
      </q-list>
    </q-card>

    <q-card>
      <q-card-title class="text-left">
        List of logged times
      </q-card-title>
      <q-card-main>
        <q-list highlight >
          <q-list-header>Logged Work hours</q-list-header>
          <q-item v-for="workhour in workhours" :key="workhour._id">
            <q-item-side left>
              <q-item-tile icon="timer" color="black" />
            </q-item-side>
            <q-item-main class="row xs-gutter">
              <q-item-tile label class="col-4">{{workhour.project_title}}</q-item-tile>
              <q-item-tile sublabel class="col">{{workhour.description}}</q-item-tile>
              <q-item-tile v-if="workhour.range" stamp class="col-2">
                {{formatWorkDate(workhour.range.from)}}
              </q-item-tile>
              <q-item-tile v-if="workhour.range" stamp class="col-1">
                {{formatWorktime(workhour.range.from)}}
              </q-item-tile>
              <q-item-tile v-if="workhour.range" stamp class="col-1 self-end">
                {{formatWorktime(workhour.range.to)}}
              </q-item-tile>
            </q-item-main>
            <q-item-side right icon="more_vert">
              <q-popover ref="popover">
                <q-list link>
                  <q-item @click="$refs.popover.close()">
                    <q-item-main label="Duplicate" />
                  </q-item>
                  <q-item @click="$refs.popover.close()">
                    <q-item-main label="Change" />
                  </q-item>
                  <q-item @click="$refs.popover.close()">
                    <q-item-main label="Move up" />
                  </q-item>
                </q-list>
              </q-popover>
            </q-item-side>
          </q-item>
        </q-list>
      </q-card-main>
    </q-card>

    <q-card>
      <q-card-title class="text-left">
        Add work hours to a project
      </q-card-title>
      <q-card-separator />
      <q-card-main>
        <q-field label="Title" :label-width="3">
          <q-input class="row col-12"
            v-model="workhour.project_title"
            float-label="Enter the project title"
          />
          <p v-if="!$v.workhour.project_title.required">The title field is required!</p>
          <p v-if="!$v.workhour.project_title.minLength">The input must be a bit longer!</p>
        </q-field>

        <q-field label="Description" :label-width="3">
          <q-input class="row col-12"
            v-model="workhour.description"
            type="textarea"
            float-label="Enter your description"
            :min-rows="1"
            />
        </q-field>
      </q-card-main>
      <q-card-separator />
      <q-card-main>
        <q-field label="Date" :label-width="3">
          <q-datetime
            type="date"
            monday-first
            format="D. MMMM YYYY"
            no-clear
            placeholder="choose a date"
            v-model="workhour.day"
            class="full-width"
          />
        </q-field>
      </q-card-main>
      <q-card-separator />
      <q-card-main>
        <q-field label="Time range" :label-width="3">
          <q-datetime-range
            type="time"
            format24h
            :default-selection="workhour.day"
            placeholder="time"
            v-model="workhour.range"
            class="full-width"
            @change="timerangeChange"
          />
        </q-field>
      </q-card-main>
      <q-card-separator />
      <q-card-main>
        <q-field label="Time span" :label-width="3">
          <q-slider
            v-model="workhour.spent_hours"
            square
            label-always
            :min="0"
            :max="12"
            :step="0.25"
            :label-value="`${sliderLabel()}`"
            snap
          />
        </q-field>
      </q-card-main>
      <q-card-separator />
      <q-card-main>
        <q-field label="Time span" :label-width="3">
          <q-input
            v-model="workhour.spent_hours"
            type="number"
            :min=0.25
            :max=13
            :step=0.25
            suffix="hours"
            label-always
            snap
            @blur="$v.workhour.spent_hours.$touch"
            :after="[
              {
                icon: 'warning',
                error: true,
                handler () {
                  // do something...
                  console.log('huhu')
                }
              }
            ]"
          />
        </q-field>
      </q-card-main>

      <q-card-main>
        <q-btn color="primary" @click="send">Log it</q-btn>
      </q-card-main>
    </q-card>
</div>
</template>

<script>
import {
  date,
  // filter,
  QAutocomplete,
  QBtn,
  QCard,
  QCardMain,
  QCardSeparator,
  QCardTitle,
  QChatMessage,
  QCheckbox,
  QDatetime,
  QDatetimeRange,
  QField,
  QInput,
  QItem,
  QItemMain,
  QItemSide,
  QItemSeparator,
  QItemTile,
  QList,
  QListHeader,
  QSearch,
  QSelect,
  QSlider,
  QPopover,
  Ripple,
  Toast
} from 'quasar'
import api from 'src/api'
import { validationMixin } from 'vuelidate'
import { required, minLength, between } from 'vuelidate/lib/validators'

// Date, rouned to next quarter hour
const
  { formatDate, addToDate } = date,
  interval = 15 // minuen // * 60 * 1000 // 15 minutes in milliseconds

var now = new Date()
now.setMinutes(Math.round(now.getMinutes() / interval) * interval)
var midnight = new Date(now)
midnight.setHours(24, 0, 0, 0)
const later = (addToDate(now, { hours: 8 }) < midnight) ? addToDate(now, { hours: 8 }) : midnight
// later = (later < midnight) ? later : midnight

// numbers, not dates...
var roundNearQuater = function (number) {
  return (Number.parseFloat(Math.round(number * 4) / 4).toFixed(2))
}

function roundTime (t) {
  let r = t
  r.setMinutes(Math.round(r.getMinutes() / interval) * interval)
  return r
}

function fuzzysearch (needle, haystack) {
  var tlen = haystack.length
  var qlen = needle.length
  if (qlen > tlen) {
    return false
  }
  if (qlen === tlen) {
    return needle === haystack
  }
  // eslint-disable-next-line no-labels
  outer: for (var i = 0, j = 0; i < qlen; i++) {
    var nch = needle.charCodeAt(i)
    while (j < tlen) {
      if (haystack.charCodeAt(j++) === nch) {
        // eslint-disable-next-line no-labels
        continue outer
      }
    }
    return false
  }
  return true
}

function parseProjects (list) {
  return list.map(prj => {
    return {
      label: prj.title,
      value: prj.title,
      description: prj.description,
      id: prj._id
    }
  })
}

const
  emptyWorkhour = {
    day: now,
    range: {
      from: now,
      to: (later < midnight) ? later : midnight
    },
    spent_hours: +roundNearQuater((later - now) / 3600000),
    project_title: 'none'
  }

export default {
  directives: {
    Ripple
  },
  name: 'workhours',
  components: {
    date,
    QAutocomplete,
    QBtn,
    QCard,
    QCardMain,
    QCardSeparator,
    QCardTitle,
    QChatMessage,
    QCheckbox,
    QDatetime,
    QDatetimeRange,
    QField,
    QInput,
    QItem,
    QItemMain,
    QItemSide,
    QItemSeparator,
    QItemTile,
    QList,
    QListHeader,
    QPopover,
    QSearch,
    QSelect,
    QSlider,
    Ripple,
    Toast
  },
  mixins: [validationMixin],
  props: ['user'],
  data () {
    return {
      workhour: emptyWorkhour,
      workhours: [],
      projects: [],
      times: [],
      selectOptions: []
    }
  },
  computed: {
  },
  validations: {
    workhour: {
      project_title: { required, minLength: minLength(4) },
      spent_hours: { required, between: between(0, 24) }
    }
  },
  methods: {
    prjTileClick (prjid) {
      let p = null
      for (var i = this.$data.projects.length - 1; i >= 0; i--) {
        if (this.$data.projects[i]._id === prjid) {
          p = this.$data.projects[i]
          break
        }
      }
      if (p !== null) {
        this.$data.workhour.project_id = prjid
        this.workhour.project_title = p.title
        console.log('tile click: ' + p.title)
      }
      else {
        console.log('Ups. no project.')
      }
    },
    sliderLabel () {
      return (roundNearQuater(this.$data.workhour.spent_hours) || '0') + 'h'
    },
    timerangeChange (range) {
      let timefrom = null
      let timeto = null
      let midnight = null
      let timespan = 0
      if (range.from) {
        timefrom = roundTime(new Date(range.from))
        midnight = new Date(timefrom)
        midnight.setHours(24, 0, 0, 0)
      }
      if (range.to) {
        timeto = roundTime(new Date(range.to))
        if (timeto > midnight) {
          timeto = midnight
        }
      }
      if (timefrom && timeto && timefrom < timeto) {
        range.from = timefrom
        range.to = timeto
        // times in milli seconds to hours
        timespan = roundNearQuater((timeto - timefrom) / 3600000)
        this.$data.workhour.spent_hours = +timespan
      }
      else {
        console.log('Ups. Datetime kaputt')
      }
      return timespan
    },
    selectedProject (item) {
      Toast.create(`Selected suggestion "${item.label}"`)
      console.log('autocomplete ' + item.label, item)
    },
    searchProject (terms, done) {
      const token = terms.toLowerCase()
      console.log('search ' + token)
      // let hits = []
      // let hits = parseProjects(this.$data.projects)
      //   .filter(item => fuzzysearch(token, item.label.toLowerCase()))
      // console.log('hits: ', hits)
      // done(hits)
      // Ajax mit timeout
      setTimeout(() => {
        let hits = parseProjects(this.$data.projects)
          .filter(item => fuzzysearch(token, item.label.toLowerCase()) || fuzzysearch(token, item.description.toLowerCase()))
        console.log('hits: ', hits)
        done(hits)
        // done(filter(terms, {field: 'title', list: parseProjects()}))
      }, 1000)
      // done([])
    },
    isSent (workhour) {
      return (workhour.userId === this.user._id)
    },
    formatGenericDate (t, f) {
      return formatDate(t, f)
    },
    formatWorktime (t) {
      return formatDate(t, 'H:mm')
    },
    formatWorkDate (t) {
      return formatDate(t, 'ddd, D. MMM')
    },
    send () {
      if (this.$data.workhour) {
        api.service('times').create(this.$data.workhour)
          .then(() => {
            let w = this.$data.workhour
            Toast.create(`Logged ${w.spent_hours} to project ${w.project_title}`)
            this.$data.workhour = emptyWorkhour
          })
      }
    }
  },
  watch: {
    'workhour.spent_hours': {
      handler: function (val) {
        console.log('workhour spent_hours changed.', val)
        let w = this.$data.workhour
        w.range.to = addToDate(w.range.from, { hours: val })
      },
      deep: true
    },
    'workhour.day': {
      handler: function (val) {
        console.log('workhour day changed.', val)
        let w = this.$data.workhour.range
        w.from.setYear(val.getFullYear())
        w.from.setMonth(val.getMonth())
        w.from.setDate(val.getDate())
        // w.from.setMilliseconds(val.getMilliseconds())
        w.to = addToDate(w.from, { hours: this.$data.workhour.spent_hours })
      }
    }
  },
  mounted () {
    const times = api.service('times')
    const projects = api.service('projects')

    // Get all the projects
    projects.find({
      query: {
        $sort: { createdAt: -1 },
        $limit: 25
      }
    })
      .then((response) => {
        // We want the latest projects but in the reversed order
        this.$data.projects = response.data.reverse()

        let opts = []
        response.data.forEach(function (pr) {
          let opt = {
            label: pr.title,
            value: pr._id
          }
          opts.push(opt)
        })
        this.$data.selectOptions = opts
      })

    // Get recent logged times
    times.find({
      query: {
        $sort: { createdAt: -1 },
        $limit: 25
      }
    })
      .then((response) => {
        // We want the latest times but in the reversed order
        this.$data.workhours = response.data.reverse()
      })

    // Add new times to the time list
    times.on('created', workhour => {
      console.log('added.')
      this.$data.workhours.unshift(workhour)
    })
  }
}
</script>

<style lang="styl">
</style>
