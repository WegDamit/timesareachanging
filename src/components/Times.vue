<template>
  <div>
    <!-- select one project -->
    <q-card class="row items-end">
      <q-card-title class="text-left col-12">
        Select a single project
      </q-card-title>
      <q-card-main class="col-xs-12 col-sm-6">
        <q-field
          helper="Search in title and description"
        >
          <q-search
            v-model="workhour.project_title"
            placeholder="Start typing a project name"
            float-label="Autocomplete"
          >
            <q-autocomplete
              @search="searchProject"
              @selected="selectedProject"
              :min-characters="2"
            />
          </q-search>
      </q-field>
      </q-card-main>
      <q-card-main class="col-xs-12 col-sm-6">
        <q-field
          helper="Choose from list from backend"
        >
          <q-select
            v-model="workhour.project_id"
            :options="selectOptions"
            separator
            filter
            autofocus-filter
            filter-placeholder="Search in list"
            float-label="Select one from list"
          />
        </q-field>
      </q-card-main>
    </q-card>

    <!-- tiles with projects -->
    <div class="row">
      <div
        v-for="project in projects"
        class="col-xs-12 col-sm-6 col-md-4 col-lg-2"
      >
        <q-card
          :key="project._id"
          v-on:click="prjTileClick(project._id)"
          v-ripple
          class="prjTile relative-position"
          v-bind:class="{ activeTile:  workhour.project_id === project._id }"
        >
          <q-card-title>
            {{project.title}}
          </q-card-title>
          <q-card-separator v-if="project.description" />
          <q-card-main v-if="project.description!==''">
            <span v-html="tileDescription(project.description, 280)"> </span>
          </q-card-main>
        </q-card>
      </div>
    </div>

    <!-- list of projects -->
    <project-list :projects="projects" :clickPrjFn="prjTileClick"></project-list>

    <!-- list of logged times -->
    <workhours-list
      :workhours="workhours"
      :clickFn="workhoursListClick"
      :fabFns="fabFns"
      title="All logged Work hours"
    ></workhours-list>

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
            @blur="$v.workhour.project_title.$touch"
            :error="$v.workhour.project_title.$error"
          />
          <p v-if="!$v.workhour.project_title.required">The title field is required.</p>
          <p v-if="!$v.workhour.project_title.minLength">The input must be a bit longer...</p>
          <p v-if="!$v.workhour.project_title.isInList">The input must be the name of a known project.</p>
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
            :min=0.0
            :max=14
            :step=0.25
            :max-decimals=2
            suffix=" hours"
            label-always
            snap
            @blur="$v.workhour.spent_hours.$touch"
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
  QDatetime,
  QDatetimeRange,
  QFab,
  QFabAction,
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
import ProjectList from './ProjectList.vue'
import WorkhoursList from './WorkhoursList.vue'

// Date, rouned to next quarter hour
const
  { formatDate, addToDate } = date,
  interval = 15, // minuten // * 60 * 1000 // 15 minutes in milliseconds
  times = api.service('workhours')

var now = roundTime(new Date())
var midnight = new Date(now)
midnight.setHours(24, 0, 0, 0)
const later = (addToDate(now, { hours: 8 }) < midnight) ? addToDate(now, { hours: 8 }) : midnight
// later = (later < midnight) ? later : midnight

// numbers, not dates...
var roundNearQuarter = function (number) {
  return (Number.parseFloat(Math.round(number * 4) / 4).toFixed(2))
}
// round times to the next quarter of an hour.
function roundTime (t) {
  let r = new Date(t)
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

// eslint-disable-next-line no-unused-vars
function fabFavorite (workhour) { // eslint-disable-line no-unused-vars
  var actionmsg = '???'
  if (workhour.favorite) {
    workhour.favorite = false
    delete workhour.favorite_date
    actionmsg = 'Removed from favorites.'
  }
  else {
    workhour.favorite = true
    workhour.favorite_date = new Date()
    actionmsg = 'Marked as a favorite.'
  }
  api.service('workhours').update(workhour._id, workhour)
    .then(() => {
      console.log('huhu ' + JSON.stringify(workhour), workhour._id)
      Toast.create(actionmsg)
    })
    .catch(err => console.log(err))
}
function getWorkhours (query) {
  // console.log('workhours query DB ', query)
  return times.find({
    query: query
  })
}

function isInPrjList (value, list) {
  return typeof value === 'string' && list.find(p => p.title === value)
}

const
  emptyWorkhour = {
    day: now,
    range: {
      from: now,
      to: (later < midnight) ? later : midnight
    },
    spent_hours: +roundNearQuarter((later - now) / 3600000),
    project_title: ''
  }

export default {
  name: 'workhours',
  components: {
    date,
    ProjectList,
    QAutocomplete,
    QBtn,
    QCard,
    QCardMain,
    QCardSeparator,
    QCardTitle,
    QDatetime,
    QDatetimeRange,
    QFab,
    QFabAction,
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
    Toast,
    WorkhoursList
  },
  mixins: [validationMixin],
  directives: { Ripple },
  props: ['user'],
  data () {
    return {
      workhour: emptyWorkhour,
      workhours: [],
      projects: [],
      selectOptions: [],
      fabFns: [
        { name: 'favorite', fn: fabFavorite, color: 'red', icon: 'favorite' },
        { name: 'add', fn: fabFavorite, color: 'purple', icon: 'add alarm' },
        { name: 'build', fn: fabFavorite, color: 'black', icon: 'build' },
        { name: 'edit', fn: fabFavorite, color: 'blue', icon: 'mode edit' }
      ]
    }
  },
  computed: {
  },
  validations: {
    workhour: {
      project_title: {
        required,
        minLength: minLength(4),
        isInList (value) {
          // none is ok, for a while
          if (value === '') return true
          return new Promise((resolve, reject) => {
            console.log('validation ' + value)
            resolve(isInPrjList(value, this.$data.projects))
          })
        }
      },
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
        // console.log('tile click: ' + p.title)
        Toast.create(`Project ${p.title} selected.`)
      }
      else {
        console.log('Ups. no project.')
      }
    },
    workhoursListClick (workhourId) {
      console.log('huhu', workhourId)
    },
    sliderLabel () {
      return (roundNearQuarter(this.$data.workhour.spent_hours) || '0') + 'h'
    },
    tileDescription (desc, n) {
      if (desc.length <= n) { return desc }
      const subString = desc.substr(0, n - 1)
      return (subString.substr(0, subString.lastIndexOf(' '))) + '&hellip;'
    },
    timerangeChange (range) {
      let timefrom = null
      let timeto = null
      let midnight = null
      let timespan = { from: new Date(), to: new Date() }
      if (range.from) {
        timefrom = roundTime(range.from)
        midnight = new Date(timefrom)
        midnight.setHours(24, 0, 0, 0) // set min, sec, ms too.
      }
      if (range.to) {
        timeto = roundTime(range.to)
        if (timeto > midnight) {
          timeto = midnight
        }
      }
      else {
        timeto = timefrom
      }
      if (timefrom && timeto && timefrom < timeto) {
        range.from = timefrom
        range.to = timeto
        // times in milli seconds to hours
        timespan = +roundNearQuarter((timeto - timefrom) / 3600000)
        this.$data.workhour.spent_hours = timespan
      }
      else {
        console.log('Ups. Datetime kaputt')
      }
      console.log('time from : ' + formatDate(timefrom, 'YY-MM-DD HH:mm Z'))
      console.log('time to   : ' + formatDate(timeto, 'YY-MM-DD HH:mm Z'))

      return this.$data.workhour.range
    },
    selectedProject (item) {
      Toast.create(`Selected suggestion "${item.label}"`)
      console.log('autocomplete ' + item.label, item)
    },
    searchProject (terms, done) {
      const token = terms.toLowerCase()
      console.log('search ' + token)
      // Ajax simulant mit timeout
      setTimeout(() => {
        let hits = parseProjects(this.$data.projects)
          .filter(item => fuzzysearch(token, item.label.toLowerCase()) || fuzzysearch(token, item.description.toLowerCase()))
        console.log('hits: ', hits)
        done(hits)
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
        api.service('workhours').create(this.$data.workhour)
          .then(() => {
            let w = this.$data.workhour
            Toast.create(`Logged ${w.spent_hours} to project ${w.project_title}`)
            this.$data.workhour = emptyWorkhour
          })
      }
    }
  },
  watch: {
    'workhour.project_id': {
      handler: function (val) {
        let w = this.$data.workhour
        const prj = this.$data.projects.find(p => p._id === val)
        if (prj) {
          w.project_title = prj.title
          // console.log('workhour project_id changed.', val, prj.title)
        }
        else {
          console.log('Ups. unbekanntes project.', val)
        }
      },
      deep: true
    },
    'workhour.project_title': {
      handler: function (val) {
        const query = {
          // _id: this.$data.workhour.project_id,
          project_title: val,
          $sort: { createdAt: -1 },
          $limit: 25
        }
        if (isInPrjList(val, this.$data.projects)) {
          const prj = this.$data.projects.find(p => p.title === val)
          if (prj) {
            this.$data.workhour.project_id = prj._id
            // console.log('workhour project_id changed.', val, prj._id)
          }
          console.log('Updating workhour list for selected project ' + val, query)
          getWorkhours(query)
            .then((response) => {
              if (response.data.length > 0) {
                this.$data.workhours = response.data
                console.log('updated DB results: ', this.$data.workhours)
              }
            })
        }
      }
    },
    'workhour.spent_hours': {
      handler: function (val) {
        console.log('workhour spent_hours changed.', val)
        if (val === null) val = 0.0
        let w = this.$data.workhour
        const tt = new Date(w.range.from.getTime() + val * 3600000)
        console.log('time to   : ' + formatDate(tt, 'YY-MM-DD HH:mm Z'))
        w.range.to = tt
        w.spent_hours = +w.spent_hours
        // addToDate(w.range.from, { hours: val })
      }
    },
    'workhour.day': {
      handler: function (val) {
        console.log('workhour day changed.', val)
        let w = this.$data.workhour.range
        w.from.setYear(val.getFullYear())
        w.from.setMonth(val.getMonth())
        w.from.setDate(val.getDate())
        // w.from.setMilliseconds(val.getMilliseconds())
        w.to = new Date(w.from.getTime() + this.$data.workhour.spent_hours * 3600000)
        // w.to = addToDate(w.from, { hours: this.$data.workhour.spent_hours })
      }
    }
  },
  mounted () {
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
    getWorkhours({
      $sort: { createdAt: -1 },
      $limit: 25
    })
      .then((response) => {
        this.$data.workhours = response.data
        console.log('query DB results: ', this.$data.workhours)
      })

    // Add new times to the time list
    times.on('created', workhour => {
      console.log('added.')
      this.$data.workhours.unshift(workhour)
    })
  }
}
</script>

<style lang="stylus" type="text/stylus" scoped>
.prjTile
  height  93%

.prjDate
  font-size 80%

.activeTile
  background-color: LightBlue

</style>
