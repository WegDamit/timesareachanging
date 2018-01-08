<template>
  <div id="projectsOverview">
    <project-list :projects="projects" :clickPrjFn="prjTileClick"></project-list>

    <q-list highlight >
      <q-list-header>Projects</q-list-header>
      <q-item v-for="project in projects" :key="project._id">
        <q-item-side left>
          <q-item-tile icon="directions_run" color="black" />
        </q-item-side>
        <q-item-main class="row xs-gutter">
          <q-item-tile label class="col-4">{{project.title}}</q-item-tile>
          <q-item-tile sublabel class="col-auto">{{project.description}}</q-item-tile>
          <q-item-tile v-if="project.range" stamp class="col-2">
            {{formatPrjDate(project.range.from)}}
          </q-item-tile>
          <q-item-tile v-if="project.range" stamp class="col-2 self-end">
            {{formatPrjDate(project.range.to)}}
          </q-item-tile>
        </q-item-main>
        <q-item-side right icon="more_vert">
          <q-popover ref="popover">
            <q-list link>
              <q-item @click="$refs.popover.close()">
                <q-item-main label="Edit" />
              </q-item>
              <q-item @click="$refs.popover.close()">
                <q-item-main label="Favorite" />
              </q-item>
              <q-item @click="$refs.popover.close()">
                <q-item-main label="Move up" />
              </q-item>
            </q-list>
          </q-popover>
        </q-item-side>
      </q-item>
    </q-list>
    <!-- Da -->
    <q-card>
      <q-card-title class="text-left">
        New Project
      </q-card-title>
      <q-card-separator />
      <q-card-main>
        <q-field label="Title" :label-width="3">
          <q-input class="row col-12"
            :after="[{icon: 'arrow_forward', content: true, handler () {}}]"
            v-model.trim="project.title"
            float-label="Enter the project title"
            @blur="$v.project.title.$touch"
            :error="$v.project.title.$error"
          />
          <p v-if="!$v.project.title.required">The title field is required!</p>
          <p v-if="!$v.project.title.minLength">The input must be a bit longer!</p>
        </q-field>
        <q-field label="Description" :label-width="3">
          <q-input class="row col-12"
            v-model="project.description"
            type="textarea"
            float-label="Enter your description"
            :min-rows="1"
            />
        </q-field>
      </q-card-main>
      <q-card-separator />
      <q-card-main>
        <q-field label="Time range" :label-width="3">
          <q-datetime-range
            v-model="project.range"
            monday-first
            format24h
            class="full-width"
          />
        </q-field>
      </q-card-main>
      <q-card-separator />
      <q-card-main>
        <div class="group column">
          <q-checkbox v-model="project.workwork" label="Working on it" />
        </div>
      </q-card-main>
      <q-card-separator />
      <q-card-main>
        <q-btn color="primary" @click="submit">Create</q-btn>
      </q-card-main>
    </q-card>
  </div>
</template>

<script>
import {
  date,
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
  QItemTile,
  QList,
  QListHeader,
  QPopover,
  Toast
} from 'quasar'
import api from 'src/api'
import { validationMixin } from 'vuelidate'
import { required, minLength } from 'vuelidate/lib/validators'
import ProjectList from './ProjectList.vue'

const
  { formatDate } = date
// today = new Date(),
// past = subtractFromDate(today, {days: 5}),
// future = addToDate(today, {days: 3})

export default {
  name: 'Project',
  components: {
    date,
    ProjectList,
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
    QItemTile,
    QList,
    QListHeader,
    QPopover,
    Toast
  },
  mixins: [validationMixin],
  props: ['user'],
  data () {
    return {
      project: {
        title: null,
        desc: null,
        workwork: true,
        range: {
          from: null,
          to: null
        }
      },
      projects: []
    }
  },
  computed: {
  },
  validations: {
    project: {
      title: { required, minLength: minLength(4) }
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
        Toast.create(`Project "${p.title}"" selected.`)
      }
      else {
        console.log('Ups. no project.')
      }
    },
    isSent (project) {
      return (project.userId === this.user._id)
    },
    formatPrjDate (t) {
      return formatDate(t, 'YYYY-MM-DD')
    },
    send () {
      if (this.$data.project) {
        api.service('projects').create({ text: this.$data.project })
          .then(() => {
            this.$data.project = ''
          })
      }
    },
    submit () {
      this.$v.project.$touch()
      if (this.$v.project.$error) {
        Toast.create('Please review fields again.')
        return
      }
      if (this.$data.project) {
        api.service('projects').create(this.$data.project)
          .then(() => {
            this.$data.project = ''
          })
      }
    }
  },
  mounted () {
    const projects = api.service('projects')
    // const users = api.service('users')

    // Get all users and projects
    projects.find({
      query: {
        $sort: { createdAt: -1 },
        $limit: 25
      }
    })
      .then((response) => {
        // We want the latest projects but in the reversed order
        this.$data.projects = response.data.reverse()
      })

    projects.on('created', project => {
      this.$data.projects.unshift(project)
    })

    /*
    users.find()
      .then((response) => {
        this.$data.users = response.data
      })

    // Add new users to the user list
    users.on('created', user => {
      this.$data.users = this.$data.users.concat(user)
    })
    */
  }
}
</script>

<style lang="styl">
</style>
