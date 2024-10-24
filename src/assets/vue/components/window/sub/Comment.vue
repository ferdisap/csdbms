<script>
import axios from 'axios';
import { installCheckbox } from '../../../../js/gui/Checkbox';
import FloatMenu from '../../menu/FloatMenu.vue';

function openPreferences(windowEl, props) {
  const event = new Event("new-window");
  event.data = {
    parent: {
      app: windowEl,
      type: 'property'
    },
    property: {
      name: 'PropertyCommentCreatePreverences',
      props: props,
      style: {
        position: 'absolute',
        width: '600px',
        height: 'auto',
        top: (((top.innerHeight / 2) - 400) + 'px'),
        left: (((top.innerWidth / 2) - 300) + 'px'),
        backgroundColor: '#ffffff',
      }
    }
  }
  top.dispatchEvent(event);
}

function arrangeComments(coms) {
  const comTypeQ = [];
  const comTypeI = [];
  const comTypeR = [];
  coms.map(com => {
    switch (com.commentType) {
      case 'q': comTypeQ.push(com); break;
      case 'i': comTypeI.push(com); break;
      case 'r': comTypeR.push(com); break;
    }
  })
  comTypeI.map(comI => {
    const parent = comTypeQ.find(comQ => {
      const threeDigitComI = comI.seqNumber.substring(0, 3);
      return comQ.modelIdentCode === comI.modelIdentCode &&
        comQ.senderIdent === comI.senderIdent &&
        comQ.commentType === 'q' &&
        (comQ.seqNumber.substring(0, 3) === threeDigitComI);
    });
    parent.children = (parent.children ? parent.children : []);
    parent.children.push(comI);
  });
  comTypeR.map(comI => {
    const parent = comTypeQ.find(comQ => {
      const threeDigitComI = comI.seqNumber.substring(0, 3);
      return comQ.modelIdentCode === comI.modelIdentCode &&
        comQ.senderIdent === comI.senderIdent &&
        comQ.commentType === 'q' &&
        (comQ.seqNumber.substring(0, 3) === threeDigitComI);
    });
    parent.children = (parent.children ? parent.children : []);
    parent.children.push(comI);
  });
  return comTypeQ;
}

function htmlString(coms) {
  // ${comment.commentType === 'q' ? 'ml-1' : 'ml-3'}"
  const makeTemplate = (comment) => {
    let str = `<div class="cb-room list type-${comment.commentType}">`;
    str += `<div class="cb-window"><input type="checkbox" value="${comment.csdb.filename}"></input></div>`;
    str += `<div>`;
    str += `<div comment-type="${comment.commentType}">`;
    // add comment sender last name
    str += `<h6>${comment.csdb.initiator.email}<span class="date"> ${comment.csdb.last_history.created_at}</span></h6>`
    str += `<div class="com-filename">${comment.csdb.filename}</div>`
    // add comment para
    str += `<div class="para-container">`;
    comment.commentContent.forEach(content => {
      str += `<p class="simple-para">` + content + `</p>`;
    })
    str += `</div>`;
    str += `</div>`;
    // add button reply
    // str += `<div @click="createEditor($event)" class="reply">reply</div>`;

    // add children
    if (comment.children) {
      comment.children.forEach(commentChild => {
        str += makeTemplate(commentChild);
      });
    }

    // add text-editor
    // will be added by Comment.vue

    str += `</div>`;
    str += `</div>`;
    return str;
  }

  const l = coms.length;
  let template = '';
  for (let i = 0; i < l; i++) {
    template += makeTemplate(coms[i]);
  }
  return template;
}

function createEditor() {
  let div = document.getElementById("comment-editor-container");
  if (!div) {
    div = document.createElement('div');
    div.setAttribute('class', 'editor-container');
    div.id = "comment-editor-container";
    div.innerHTML = `<text-editor name="commentContentSimplePara"></text-editor>
      <button id="sendBtn" type="submit" class="material-icons send">send</button>`;
  }
  return div;
}

export default {
  component: { FloatMenu },
  data() {
    return {
      commentPreferencesData: {},
    };
  },
  props: {
    filename: { type: String },
    path: { type: String },
    storage: { type: String },
  },
  methods: {
    submitComment(event) {
      this.commentPreferencesData.csdb = {
        filename: this.$props.filename,
        path: this.$props.path,
        storage: this.$props.storage,
      };
      this.commentPreferencesData.commentContentSimplePara = event.target.querySelector("text-editor[name='commentContentSimplePara']").value,
        top.cpd = JSON.stringify(this.commentPreferencesData);
      // return;
      axios.put("/api/s1000d/comment/create", this.commentPreferencesData)
        .then(this.fetchComment)
        .catch((error) => {
          this.commentPreferencesData.errors = error.response.data.errors;
          this.preference();
        });
    },
    fetchComment() {
      axios.get("/api/s1000d/comments/" + this.$props.filename)
        .then((response) => {
          const template = htmlString(arrangeComments(response.data.csdb.comments));
          const form = this.$el.querySelector("form#comment-form");
          if (!template) {
            form.innerHTML = `<div class="text-center w-full">No comments available.</div>`;
          } else {
            form.innerHTML = template;
            installCheckbox(form);
          }
        });
    },
    preference() {
      const windowEl = this.$el.parentElement.closest(".app-window");
      openPreferences(windowEl, this.commentPreferencesData);
      windowEl.property.result()
        .then(data => {
          this.commentPreferencesData = data;
        });
    },
    makeEditor(isReply) {
      // harusnya position dan parentCommentFilename ditaruh sesua dengan Checkbox current
      const form = this.$el.querySelector("form#comment-form");
      form.appendChild(createEditor());
      top.form = form;

      if(isReply){
        const cbRoom = form.current;
        this.commentPreferencesData.parentCommentFilename = cbRoom.cbWindow.cbValue
        this.commentPreferencesData.commentType = 'i';
        this.commentPreferencesData.position = [...cbRoom.querySelectorAll(".cb-room.type-i, .cb-room.type-r")].length + 1;
      }
      else {
        this.commentPreferencesData.parentCommentFilename = '';
        this.commentPreferencesData.commentType = 'q';
        this.commentPreferencesData.position = [...form.querySelectorAll(".cb-room.type-q")].length;
      }
    },
    cancel() {
      document.getElementById('comment-editor-container').remove();
    }
  },
  mounted() {
    top.cmt = this;
    this.commentPreferencesData = {
      brexDmRef: '',
      commentPriorityCode: 'cp01',
      commentRefs: this.$props.filename,
      commentType: 'q',
      countryIsoCode: 'US',
      languageIsoCode: 'en',
      parentCommentFilename: this.$props.filename,
      responseType: 'rt01',
      securityClassification: '01',
      remarks: '',
    };
    this.fetchComment();
  },
  components: { FloatMenu }
}
</script>
<template>
  <div class="comment">
    <button type="button" class="material-symbols-outlined float-end hover:bg-gray-100" @click="preference">tune</button>
    <form @submit.prevent="submitComment" id="comment-form" class="cb-home"></form>
    <FloatMenu :trigger="[{ triggerId: 'comment-form', on: 'contextmenu' }]">
      <div class="list" @click="makeEditor(true)">
        <div>reply</div>
      </div>
      <div class="list" @click="makeEditor(false)">
        <div>new</div>
      </div>
    </FloatMenu>
  </div>
</template>