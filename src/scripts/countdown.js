(function () {
    var data =  {
        seconds: '00',
        minutes: '00',
        hours: '00',
        days: '00',
        distance: 0,
        countdown: null,
        endTime: new Date('March 22, 2025 10:00:00').getTime(),
        now: new Date().getTime(),
        start: function() {
            this.countdown = setInterval(() => {
                
                // Calculate time
                this.now = new Date().getTime();
                this.distance = this.endTime - this.now;
                
                // Set Times
                this.days =  Math.floor(this.distance / (1000*60*60*24));
                this.hours = this.padNum( Math.floor((this.distance % (1000*60*60*24)) / (1000*60*60)) );
                this.minutes = this.padNum( Math.floor((this.distance % (1000*60*60)) / (1000*60)) );
                this.seconds = this.padNum( Math.floor((this.distance % (1000*60)) / 1000) );
                
                // Stop at 0
                if (this.distance < 0) {
                    clearInterval(this.countdown);
                    this.days = '00';
                    this.hours = '00';
                    this.minutes = '00';
                    this.seconds = '00';
                }

                // Set counter on page
                document.getElementById('days').textContent = this.days;
                document.getElementById('hours').textContent = this.hours;
                document.getElementById('minutes').textContent = this.minutes;
                document.getElementById('seconds').textContent = this.seconds;
            },100);
        },
        padNum: function(num) {
            var zero = '';
            for (var i = 0; i < 2; i++) {
                zero += '0';
            }
            return (zero + num).slice(-2);
        }
    };

    document.addEventListener('DOMContentLoaded', () => {
        console.log('Starting countdown')
        if (document.getElementById('days'))
            data.start();
    });

}());