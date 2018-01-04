<template>
  <div class="WorkhoursList">
  <q-list highlight class="workhoursList">
    <q-list-header>{{title}}</q-list-header>
    <q-item v-for="workhour in workhours" :key="workhour._id">
      <q-item-side left>
        <q-item-tile icon="favorite" color="red" v-if="workhour.favorite" />
        <q-item-tile icon="build" color="red" v-else-if="workhour.build" />
        <q-item-tile icon="timer" color="black" v-else/>
      </q-item-side>
      <q-item-main v-on:click="clickFn(workhour._id)" v-ripple  class="row xs-gutter">
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

      <q-item-side right>
        <q-fab v-if="fabFns.length > 0"
          color="purple"
          icon="keyboard_arrow_left"
          direction="left"
        >
          <q-fab-action v-for="fab in fabFns"
            :color="fab.color || 'blue'"
            @click="workhourFabFn(fab.name, workhour)"
            :icon="fab.icon"
          />
        </q-fab>
      </q-item-side>
    </q-item>
  </q-list>
  </div>
</template>

<script>

import {
  date,
  QCard,
  QCardMain,
  QCardSeparator,
  QCardTitle,
  QFab,
  QFabAction,
  QItem,
  QItemMain,
  QItemSide,
  QItemSeparator,
  QItemTile,
  QList,
  QListHeader,
  Ripple
} from 'quasar'

const
  { formatDate } = date

export default {
  name: 'WorkhoursList',
  props: ['workhours', 'clickFn', 'title', 'fabFavoriteFn', 'fabFns'],
  components: {
    date,
    QCard,
    QCardMain,
    QCardSeparator,
    QCardTitle,
    QFab,
    QFabAction,
    QItem,
    QItemMain,
    QItemSide,
    QItemSeparator,
    QItemTile,
    QList,
    QListHeader,
    Ripple
  },
  methods: {
    workhourFabFn (key, workhour) {
      console.log(this.fabFns)
      var fab = this.fabFns.find(ffn => ffn.name === key)
      if (fab.fn) {
        fab.fn(workhour)
      }
    },
    hasFab (key) {
      const has = this.fabFns.find(ffn => ffn.name === key)
      if (has) return true
      return false
    },
    formatGenericDate (t, f) {
      return formatDate(t, f)
    },
    formatWorktime (t) {
      return formatDate(t, 'H:mm')
    },
    formatWorkDate (t) {
      return formatDate(t, 'ddd, D. MMM')
    }
  },
  directives: {
    Ripple
  },
  mounted () {
    console.log('fabs ', this.fabFns)
  }
}
</script>

<style lang="stylus" type="text/stylus" scope>
.workhoursList
  .worrkoursDate
    font-size 80%
</style>
