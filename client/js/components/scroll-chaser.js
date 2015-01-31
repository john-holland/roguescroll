module.exports = function() {
    return {
        onAdd: function() {
            this.$game = $("#game");
            this.$menu = $("#menu");
            this.$scrollContainer = $("#scroll-container");
            this.$document = $(document);
            this.topMargin = $(document).height() / 2;
            this.$window = $(window);
            var self = this;
            this.$window.resize(function() {
                //maybe debounce this?
                self.topMargin = self.$window.height() / 2;
            });
        },
        update: function(dt, entity, component) {
            var top = Math.max(this.$document.scrollTop() - this.$menu.height(), 0) + this.topMargin;

            this.target.y = top;
        },
        requiredComponents: ["movement"],
        messages: {
            'set-scroll-to-position': function() {
                this.$document.scrollTop(this.position.y + this.topMargin - $('nav').height());
            }
        }
    };
}